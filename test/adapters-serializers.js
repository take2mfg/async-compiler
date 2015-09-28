import { expect } from 'chai';
import nock from 'nock';
import AsyncCompiler from '../lib/async-compiler';


const yamlFile = `
site:
  title: 'FastBannerSigns.com'
  fb-info: 'Info to show to facebook crawler'
  twitter-info: 'Info that twitter crawler grabs'

pages:
  index:
    needs:
      # use adapters to fetch data from services
      # adapters are called by name (take2 for example) and they receive the attributes
      # declared here. They return a promise that resolves in the data needed.
      # This resolved data is merged into the context to be used by the corresponding
      # hbs template file
      'featured-banners':
        type: 'group'
        slug: 7
        adapter: take2

categories:
  freeway-signs:
    # TODO: allow also slugs, not ids only
    # template-group-slug: 'fw-signs'
    group: 1
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
    const originalFixture = require('./fixtures/serializers/original-product-template-group');
    const normalizedFixture = require('./fixtures/serializers/normalized-product-template-group');
    
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


  it('for index', function() {
    const originalFixture = require('./fixtures/serializers/original-product-template-group');
    const normalizedFixture = require('./fixtures/serializers/normalized-product-template-group');
    
    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/my-base-folder/app.yaml')
      .reply(200, yamlFile);

    nock('http://take2-dev.herokuapp.com')
      .get('/api/v1/productTemplatePairs?filter%5BtemplateGroup%5D=7&include=template%2Cproduct%2Cface')
      .reply(200, originalFixture);

    return compiler.yamlContext.getYAMLContextFor('index')
      .then(response => {
        expect(response['featured-banners'].response).to.deep.equal(normalizedFixture);
      });
  });

});
