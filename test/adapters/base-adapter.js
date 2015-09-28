import BaseAdapter from '../../lib/async-compiler/adapters/base-adapter';

describe('BaseAdapter', () => {
  let adapter;
  before(() => {
    adapter = new BaseAdapter();
  });


  it('throws if "adapter" is not defined', () => {
    let options = {};
    
    return adapter.fetch(options)
      .should.be.rejectedWith(/'adapter'/);
  });

});
