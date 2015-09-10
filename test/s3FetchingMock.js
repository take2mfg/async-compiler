import { expect } from 'chai';
import fs from 'fs';

import { getSpyableCompiler } from './testUtils';


const baseDir = './test/yamlContext/fixtures';


describe('S3 fetching mock', () => {

  it('resolves on the setted data', () => {
    let compiler = getSpyableCompiler();
    
    let basicYAML = fs.readFileSync(baseDir + '/basic.yaml', 'utf8');
    compiler.NEXT_S3_RESPONSE = {
      Body: basicYAML
    };

    return compiler.fetchFromS3('basic.yaml')
      .then(data => {
        expect(data.Body).to.be.equal(basicYAML);
      });
  });

});