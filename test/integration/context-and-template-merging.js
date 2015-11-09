import { expect } from 'chai';
import nock from 'nock';
import fs from 'fs';
import cheerio from 'cheerio';

import Compiler from '../../lib/async-compiler';


const baseYAMLDir = './test/fixtures';

const notFoundHBS = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Not Found</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

  </head>
  <body>
    
    <h1>Sorry, the page was not found.</h1>

  </body>
</html>
`;

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

const freewaySignsHBS = `
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
    
    <p class="template-in-category-name">
      {{category.response.0.template.attributes.name}}
    </p>

    <p class="my-featured-product-name">
      {{my-featured-product.response.product.name}}
    </p>

    <p class="my-featured-template-with-includes-name">
      {{my-featured-template-with-includes.response.template.name}}
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

  it('renders a 404 template on error', () => {
    let compiler = new Compiler({
      s3KeyId        : 'test-s3-key-id',
      s3AccessKey    : 'test-s3-access-key',
      defaultBucket  : 'test-default-bucket',
      take2ApiHost   : 'http://take2-loopback.herokuapp.com/api/v1',
      take2SecretKey : 'sk_somefakekey'
    });

    const baseYAML = fs.readFileSync(baseYAMLDir + `/basic.yaml`, 'utf8');
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, baseYAML);

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .head('/404.hbs')
      .reply(200, { ContentType: true });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/404.hbs')
      .reply(200, notFoundHBS);

    return compiler.fetchCompileAndMerge('404')
      .then(renderedPage => {
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal('Page Not Found');
        expect($('h1').html().trim()).to.be.equal('Sorry, the page was not found.');
      });


  });


  it('fetchs, renders and merges home', () => {
    let compiler = new Compiler({
      s3KeyId        : 'test-s3-key-id',
      s3AccessKey    : 'test-s3-access-key',
      defaultBucket  : 'test-default-bucket',
      take2ApiHost   : 'http://take2-loopback.herokuapp.com/api/v1',
      take2SecretKey : 'sk_somefakekey'
    });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .head('/index.hbs')
      .reply(200, { ContentType: true });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/index.hbs')
      .reply(200, baseHBS);

    const baseYAML = fs.readFileSync(baseYAMLDir + `/basic.yaml`, 'utf8');
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, baseYAML);

    const largeBannerResponse = { product: { description: 'This is my product description' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=3')
      .reply(200, largeBannerResponse);

    const featuredSignsResponse = { product: { description: 'This is my other product' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=5')
      .reply(200, featuredSignsResponse);

    nock('http://api.github.example.com')
      .get('/pulls?user=myuser')
      .reply(200, { pulls: ['some pull'] });

    return compiler.fetchCompileAndMerge('index')
      .then(renderedPage => {
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal('FastBannerSigns.com');
        expect($('.product-description').html().trim()).to.be.equal(largeBannerResponse.product.description);
        expect($('.other-product-description').html().trim()).to.be.equal(featuredSignsResponse.product.description);
      });
  });


  it('fetchs, renders and merges freeway-signs category', function() {
    let compiler = new Compiler({
      s3KeyId        : 'test-s3-key-id',
      s3AccessKey    : 'test-s3-access-key',
      defaultBucket  : 'test-default-bucket',
      take2ApiHost   : 'http://take2-loopback.herokuapp.com/api/v1',
      take2SecretKey : 'sk_somefakekey'
    });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .head('/freeway-signs.hbs')
      .reply(200, { ContentType: true });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/freeway-signs.hbs')
      .reply(200, freewaySignsHBS);

    const baseYAML = fs.readFileSync(baseYAMLDir + `/basic.yaml`, 'utf8');
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, baseYAML);

    const freewaySignsResponse = {"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]};
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=1')
      .reply(200, freewaySignsResponse);

    const productResponse = { product: { name: 'My featured product' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/products/13')
      .reply(200, productResponse);

    const templateResponse = { template: { name: 'My featured template' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/templates/14?include=faces%2Cfaces.designs')
      .reply(200, templateResponse);

    return compiler.fetchCompileAndMerge('freeway-signs')
      .then(renderedPage => {
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal('FastBannerSigns.com');
        expect($('.template-in-category-name').html().trim()).to.be.equal('My temp');
        
        expect($('.my-featured-product-name').html().trim()).to.be.equal(productResponse.product.name);
        expect($('.my-featured-template-with-includes-name').html().trim()).to.be.equal(templateResponse.template.name);
      });
  });

  it('fetchs, renders and merges freeway-signs category from category.hbs', function() {
    let compiler = new Compiler({
      s3KeyId        : 'test-s3-key-id',
      s3AccessKey    : 'test-s3-access-key',
      defaultBucket  : 'test-default-bucket',
      take2ApiHost   : 'http://take2-loopback.herokuapp.com/api/v1',
      take2SecretKey : 'sk_somefakekey'
    });

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/freeway-signs.hbs')
      .reply(404);

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/category.hbs')
      .reply(200, freewaySignsHBS);

    const baseYAML = fs.readFileSync(baseYAMLDir + `/basic.yaml`, 'utf8');
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, baseYAML);

    const freewaySignsResponse = {"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]};
    // const freewaySignsResponse = {};
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=1')
      .reply(200, freewaySignsResponse);

    const productResponse = { product: { name: 'My featured product' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/products/13')
      .reply(200, productResponse);

    const templateResponse = { template: { name: 'My featured template' } };
    nock('http://take2-loopback.herokuapp.com/api/v1')
      .get('/templates/14?include=faces%2Cfaces.designs')
      .reply(200, templateResponse);

    return compiler.fetchCompileAndMerge('freeway-signs')
      .then(renderedPage => {
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal('FastBannerSigns.com');
        expect($('.template-in-category-name').html().trim()).to.be.equal('My temp');
        
        expect($('.my-featured-product-name').html().trim()).to.be.equal(productResponse.product.name);
        expect($('.my-featured-template-with-includes-name').html().trim()).to.be.equal(templateResponse.template.name);
      });
  });

});
