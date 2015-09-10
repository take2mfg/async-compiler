import { expect } from 'chai';
import fs from 'fs';

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
      return compiler.getYAMLContextFor('home')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.categories).to.have.length(2);

          expect(context['monday-featured-product']).to.exist;
          expect(context['monday-featured-product.face']).to.exist;
          expect(context['monday-featured-product.face.design']).to.exist;

          expect(context['monday-featured-template']).to.exist;
        });
    });

    it('gets context needed for freeway signs landing page', () => {
      return compiler.getYAMLContextFor('freeway-signs')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.categories).to.have.length(1);
        });
    });

    it('gets only page info for not declared landing page', () => {
      return compiler.getYAMLContextFor('not-declared-in-yaml')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');
          
          expect(context.categories).to.not.exist;
        });
    });
    
  });

});
