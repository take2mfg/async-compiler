import { expect } from 'chai';
import nock from 'nock';
import AsyncCompiler from '../../lib/async-compiler';


const yamlFile = `
site:
  title: 'FastBannerSigns.com'
  fb-info: 'Info to show to facebook crawler'
  twitter-info: 'Info that twitter crawler grabs'

pages:
  home:
    {}

categories:
  freeway-signs:
    # TODO: allow also slugs, not ids only
    # template-group-slug: 'fw-signs'
    template-group-slug: 1
`;


describe('YAMLContext Adapter and Serializer', function() {
  let compiler;
  before(() => {
    nock.disableNetConnect();

    compiler = new AsyncCompiler({
      s3KeyId: 'test-s3-key-id',
      s3AccessKey: 'test-s3-access-key',
      defaultBucket: 'test-default-bucket',
      baseFolder: 'my-base-folder',
    });
  });

  after(() => {
    nock.enableNetConnect();
    nock.cleanAll();
  });


  it('for product template groups', function() {
    const originalFixture = require('./serializers/fixtures/original-product-template-group');
    const normalizedFixture = require('./serializers/fixtures/normalized-product-template-group');
    
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/my-base-folder/app.yaml')
      .reply(200, yamlFile);

    nock('http://take2-dev.herokuapp.com')
      .get('/api/v1/productTemplatePairs?filter%5BtemplateGroup%5D=1&include=template%2Cproduct%2Cface')
      .reply(200, originalFixture);

    return compiler.yamlContext.getYAMLContextFor('freeway-signs')
      .then(response => {
        expect(response.category.response).to.deep.equal(normalizedFixture);
      });
  });

});
