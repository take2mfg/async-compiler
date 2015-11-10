import { expect } from 'chai';
import nock from 'nock';

import Compiler from '../../lib/async-compiler';


const customizableHBS = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{title}}</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="assets/vendor.css">
    <link rel="stylesheet" href="assets/take2-admin.css">

  </head>
  <body>
    
    My customizable

  </body>
</html>
`;


const specificHBS = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{title}}</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="assets/vendor.css">
    <link rel="stylesheet" href="assets/take2-admin.css">

  </head>
  <body>
    
    My specific template

  </body>
</html>
`;


function getMockCompiler() {
  return new Compiler({
    s3KeyId        : 'test-s3-key-id',
    s3AccessKey    : 'test-s3-access-key',
    defaultBucket  : 'test-default-bucket',
    take2ApiHost   : 'http://take2-loopback.herokuapp.com/api/v1',
    take2SecretKey : 'sk_somefakekey'
  });
}


describe('Fallback template fetching', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.enableNetConnect();
    nock.cleanAll();
  });


  it('fetches the fallback', function() {
    let compiler = getMockCompiler();

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/123-456.hbs')
      .reply(404, specificHBS);

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .head('/123-456.hbs')
      .reply(404);

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/customizable.hbs')
      .reply(200, customizableHBS);

    return compiler.s3Template.fetchTemplateFor('123-456', 'customizable')
      .then(template => {
        expect(template({
          title: 'My title'
        })).to.be.equal(customizableHBS.replace('{{title}}', 'My title'));
      });
  });


  it('fetches the custom template', function() {
    let compiler = getMockCompiler();

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .head('/123-456.hbs')
      .reply(200, { ContentType: true });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/123-456.hbs')
      .reply(200, specificHBS);

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/customizable.hbs')
      .reply(200, customizableHBS);

    return compiler.s3Template.fetchTemplateFor('123-456', 'customizable')
      .then(template => {
        expect(template({
          title: 'My other title'
        })).to.be.equal(specificHBS.replace('{{title}}', 'My other title'));
      });
  });

});
