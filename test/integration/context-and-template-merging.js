import { expect } from 'chai';
import nock from 'nock';
import fs from 'fs';
import cheerio from 'cheerio';

import Compiler from '../../lib/async-compiler';


const baseYAMLDir = './test/yamlContext/fixtures';


const baseHBS = `
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
    
    <p class="product-description">
      {{featured-banners.response.product.description}}
    </p>

    <p class="other-product-description">
      {{featured-signs.response.product.description}}
    </p>

    <script src="assets/vendor.js"></script>
    <script src="assets/take2-admin.js"></script>

  </body>
</html>
`;


describe('Context and template merging', () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });


  it('fetchs, renders and merges home', () => {
    let compiler = new Compiler({
      s3KeyId: 'test-s3-key-id',
      s3AccessKey: 'test-s3-access-key',
      defaultBucket: 'test-default-bucket',
    });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/home.hbs')
      .reply(200, baseHBS);

    const baseYAML = fs.readFileSync(baseYAMLDir + `/basic.yaml`, 'utf8');
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, baseYAML);

    const largeBannerResponse = { product: { description: 'This is my product description' } };
    nock('http://take2-dev.herokuapp.com/api/v1')
      .get('/productTemplatePairs?filter%5BtemplateGroup%5D=large-banners&include=template%2Cproduct%2Cface')
      .reply(200, largeBannerResponse);

    const featuredSignsResponse = { product: { description: 'This is my other product' } };
    nock('http://take2-dev.herokuapp.com/api/v1')
      .get('/productTemplatePairs?filter%5BtemplateGroup%5D=small-signs&include=template%2Cproduct%2Cface')
      .reply(200, featuredSignsResponse);

    nock('http://api.github.example.com')
      .get('/pulls?user=myuser')
      .reply(200, { pulls: ['some pull'] });

    return compiler.fetchCompileAndMerge('home')
      .then(renderedPage => {
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal('FastBannerSigns.com');
        expect($('.product-description').html().trim()).to.be.equal(largeBannerResponse.product.description);
        expect($('.other-product-description').html().trim()).to.be.equal(featuredSignsResponse.product.description);
      });
  });

});
