import { expect } from 'chai';
import nock from 'nock';

import Take2Adapter from '../../lib/async-compiler/adapters/take2-adapter';


let request = require('superagent-promise')(require('superagent'), Promise);


const take2ApiHost = 'http://example.com';


describe('URLAdapter', () => {
  let adapter;
  before(() => {
    adapter = new Take2Adapter({
      request,
      take2ApiHost,
      take2SecretKey: 'some_key',
    });
  });


  it('sends category query', function() {
    const urlHost = take2ApiHost;
    const defaultQuery = 'my parent signs';
    const response = {
      my: 'data',
      some: 'context'
    };
    const type = 'sellables';
    const groupId = 3;


    let options = {
      _key: 'my-fetch',
      adapter: 'take2',
      'default-query': defaultQuery,
      type,
      groupId,
    };

    nock(urlHost)
      .get(`/${type}`)
      .query({
        filter: {
          where: {
            groupId: groupId
          }
        },
        query: defaultQuery,
      })
      .reply(200, response);
    
    return adapter.fetch(options)
      .then(res => {
        expect(res).to.deep.equal({
          options,
          response
        });
      });
  });

});
