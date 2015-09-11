import { expect } from 'chai';
import nock from 'nock';

import URLAdapter from '../../lib/async-compiler/yamlContext/adapters/url-adapter';


let request = require('superagent-promise')(require('superagent'), Promise);


describe('URLAdapter', () => {
  let adapter;
  before(() => {
    adapter = new URLAdapter({ request });
  });


  it('throws if "path" is not defined', () => {
    let options = {
      as: 'my-fetch'
    };
    
    return adapter.fetch(options)
      .should.be.rejectedWith(/'path'/);
  });


  it('fetches and returns a well formed context', () => {
    const urlHost = 'http://example.com';
    const urlPath = '/some/url';
    const response = {
      my: 'data',
      some: 'context'
    };

    let options = {
      as: 'my-fetch',
      path: urlHost + urlPath
    };

    nock(urlHost)
      .get(urlPath)
      .reply(200, response);
    
    return adapter.fetch(options)
      .then(res => {
        expect(res).to.deep.equal({
          'my-fetch': {
            response,
            path: urlHost + urlPath
          }
        });
      });
  });

});
