import BaseSerializer from '../../lib/async-compiler/serializers/base-serializer';
import { expect } from 'chai';


describe('BaseSerializer', () => {
  let serializer;
  before(() => {
    serializer = new BaseSerializer();
  });


  it('it exists', () => {
    return expect(serializer).to.exist;
  });

});
