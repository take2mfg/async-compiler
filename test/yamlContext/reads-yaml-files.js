import { expect } from 'chai';
import fs from 'fs';
import nock from 'nock';

import { getSpyableCompiler } from '../testUtils';


const baseDir = './test/yamlContext/fixtures';
const take2ApiHost = process.env.TAKE2_API_HOST || 'http://take2-dev.herokuapp.com/api/v1';



function getCompilerWithFixture(fixtureName) {
  let compiler = getSpyableCompiler();
    
  let basicYAML = fs.readFileSync(baseDir + `/${fixtureName}`, 'utf8');
  compiler.NEXT_S3_RESPONSE = {
    Body: basicYAML
  };

  return compiler;
}


describe('YAML context', () => {

  describe('basic yaml file', () => {
    let compiler;
    before(() => {
      compiler = getCompilerWithFixture('basic.yaml');
    });


    it('gets context needed for home page', () => {
      // I need to be able to:
      // mock adapters and ensure they are being called
      

      const featuredBannersResponse = {
        items: ['some', 'items', 'here']
      };
      nock(take2ApiHost)
        .get('/productTemplatePairs?filter%5BtemplateGroup%5D=large-banners&include=template%2Cproduct%2Cface')
        .reply(200, featuredBannersResponse);

      const featuredSignsResponse = {
        items: ['signs', 'here']
      };
      nock(take2ApiHost)
        .get('/productTemplatePairs?filter%5BtemplateGroup%5D=small-signs&include=template%2Cproduct%2Cface')
        .reply(200, featuredSignsResponse);

      const githubResponse = {
        pulls: ['some', 'prs']
      };
      nock('http://api.github.example.com/')
        .get('/pulls?user=myuser')
        .reply(200, githubResponse);

      return compiler.yamlContext.getYAMLContextFor('home')
        .then(context => {
          expect(context).to.deep.equal({
            title: 'FastBannerSigns.com',
            'fb-info': 'Info to show to facebook crawler',
            'twitter-info': 'Info that twitter crawler grabs',
            
            'featured-banners': {
              path: `${take2ApiHost}/productTemplatePairs`,
              response: featuredBannersResponse
            },
            'featured-signs': {
              path: `${take2ApiHost}/productTemplatePairs`,
              response: featuredSignsResponse
            },
            'pull-requests': {
              path: 'http://api.github.example.com/pulls?user=myuser',
              response: githubResponse
            },
          });
        });
    });


    it('gets context needed for freeway signs landing page', () => {
      const productTemplatePairsResponse = {"freeway-signs":{"path":"http://localhost:5000/api/v1/productTemplatePairs","response":{"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]}}};
      nock(take2ApiHost)
        .get('/productTemplatePairs?filter%5BtemplateGroup%5D=1&include=template%2Cproduct%2Cface')
        .reply(200, productTemplatePairsResponse);

      return compiler.yamlContext.getYAMLContextFor('freeway-signs')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.category.response).to.deep.equal(productTemplatePairsResponse);
          // TODO: match take2 group name
          // expect(context.category['display-name']).to.be.equal('The freeway signs');
          
          // expect(context['my-featured-product']).to.exist;
          // expect(context['my-featured-pair']).to.exist;
        });
    });


    it.skip('gets context needed for large-banners category page, even with no site defined for it', () => {

      return compiler.yamlContext.getYAMLContextFor('large-banners')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['category.items']).to.exist;
          expect(context['category.display-name']).to.be.equal('Large banners!!');
        });
    });


    it.skip('reject for not declared page', () => {
      return compiler.yamlContext.getYAMLContextFor('not-declared-in-yaml')
        .should.be.rejected;
    });


    it.skip('reject for not being called nested under its parent', () => {
      return compiler.yamlContext.getYAMLContextFor('summer-party-banners')
        .should.be.rejected;
    });


    it.skip('gets nested category context', () => {
      return compiler.yamlContext.getYAMLContextFor('large-banners/summer-party-banners')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['category.items']).to.exist;
          expect(context['category.display-name']).to.be.equal('Awesome party banners!!!');
        });
    });
    
  });

});
