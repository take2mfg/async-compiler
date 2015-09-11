import BaseAdapter from '../../lib/async-compiler/yamlContext/adapters/base-adapter';


describe('BaseAdapter', () => {
  let adapter;
  before(() => {
    adapter = new BaseAdapter();
  });


  it('throws if "as" is not defined', () => {
    let options = {};
    
    return adapter.fetch(options)
      .should.be.rejectedWith(/'as'/);
  });

});
