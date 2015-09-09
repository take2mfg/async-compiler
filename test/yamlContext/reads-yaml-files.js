import Compiler from '../../lib/async-compiler';
import { expect } from 'chai';


describe('YAML files reading', () => {
  
  it('exists', () => {
    let compiler = new Compiler();
    
    expect(compiler).to.exist;
  });

});
