import { expect } from 'chai';
import fs from 'fs';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


import { getSpyableCompiler } from '../testUtils';


chai.use(chaiAsPromised);

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
      return compiler.getYAMLContextFor('home')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['featured-banners']).to.exist;
          expect(context['featured-signs']).to.exist;
          expect(context['featured-payments']).to.exist;
          expect(context['pull-requests']).to.exist;
        });
    });


    it('gets context needed for freeway signs landing page', () => {
      return compiler.getYAMLContextFor('freeway-signs')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['freeway-signs']).to.exist;          
          expect(context['my-featured-product']).to.exist;
          expect(context['my-featured-pair']).to.exist;
        });
    });


    it('gets context needed for large-banners category page, even with no site defined for it', () => {
      return compiler.getYAMLContextFor('large-banners')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['large-banners']).to.exist;
        });
    });


    it('reject for not declared page', () => {
      return compiler.getYAMLContextFor('not-declared-in-yaml')
        .should.be.rejected;
    });


    it('reject for not being called nested under its parent', () => {
      return compiler.getYAMLContextFor('summer-party-banners')
        .should.be.rejected;
    });


    it('gets nested category context', () => {
      return compiler.getYAMLContextFor('large-banners/summer-party-banners')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context['summer-party-banners']).to.exist;
          expect(context['summer-party-banners']['display-name']).to.be.equal('Awesome party banners!!!');
        });
    });
    
  });

});
