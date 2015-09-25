import ProductTemplateGroupSerializer from '../../lib/async-compiler/serializers/product-template-group-serializer.js';
import { expect } from 'chai';


describe('ProductTemplateGroupSerializer', () => {
  let serializer;
  before(() => {
    serializer = new ProductTemplateGroupSerializer();
  });


  it('nests the json response', () => {
    const originalFixture = require('../fixtures/serializers/original-product-template-group');
    const normalizedFixture = require('../fixtures/serializers/normalized-product-template-group');

    const normalized = serializer.normalize(originalFixture);
    
    expect(normalized).to.deep.equal(normalizedFixture);
  });

});
