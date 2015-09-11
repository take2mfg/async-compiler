import { expect } from 'chai';
import fs from 'fs';
import nock from 'nock';

import { getSpyableCompiler } from '../testUtils';


const baseDir = './test/yamlContext/fixtures';


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
      
      const urlHost = 'http://take2-dev.herokuapp.com/api/1';
      const response = {
        my: 'data',
        some: 'context'
      };

      nock(urlHost)
        .get('/productTemplatePairs?filter%5BtemplateGroup%5D=large-banners&include=template%2Cproduct%2Cface')
        .reply(200, response);

      // nock(urlHost)
      //   .get('/productTemplatePairs?filter%5BtemplateGroup%5D=small-signs&include=template%2Cproduct%2Cface')
      //   .reply(200, response);

      return compiler.yamlContext.getYAMLContextFor('home')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['featured-banners']).to.exist;
          // expect(context['featured-signs']).to.exist;
          // expect(context['featured-payments']).to.exist;
          // expect(context['pull-requests']).to.exist;
        });
    });


    it.skip('gets context needed for freeway signs landing page', () => {
      return compiler.getYAMLContextFor('freeway-signs')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          // here are linked freeway-signs items by default
          expect(context['category.items']).to.exist;
          // match take2 group name
          expect(context['category.display-name']).to.be.equal('The freeway signs');
          
          expect(context['my-featured-product']).to.exist;
          expect(context['my-featured-pair']).to.exist;
        });
    });


    it.skip('gets context needed for large-banners category page, even with no site defined for it', () => {
      return compiler.getYAMLContextFor('large-banners')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['category.items']).to.exist;
          expect(context['category.display-name']).to.be.equal('Large banners!!');
        });
    });


    it.skip('reject for not declared page', () => {
      return compiler.getYAMLContextFor('not-declared-in-yaml')
        .should.be.rejected;
    });


    it.skip('reject for not being called nested under its parent', () => {
      return compiler.getYAMLContextFor('summer-party-banners')
        .should.be.rejected;
    });


    it.skip('gets nested category context', () => {
      return compiler.getYAMLContextFor('large-banners/summer-party-banners')
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
