import URLAdapter from './url-adapter.js';
import _ from 'lodash';


export function Take2AdapterException(message) {
  this.message = message;
  this.name = 'Take2AdapterException';
}


export default class extends URLAdapter {

  constructor(options) {
    super(options);

    if(!options.take2SecretKey) {
      throw new Take2AdapterException(`Take2 key is not defined.  Cannot create adapter.`);
    }

    if(!options.take2ApiHost) {
      throw new Take2AdapterException(`Take2 host is not defined.  Cannot create adapter.`);
    }

    this.TAKE2_SECRET_KEY = options.take2SecretKey;
    this.TAKE2_API_HOST   = options.take2ApiHost;
  }

  configureQuery(options) {
    let query = null;
    if (options.type === 'sellables') {
      query = query || {};
      query.filter = {
        where: {
          groupId: options.groupId
        }
      };
    } else {
      if (options.filter) {
        query = query || {};
        query.filter = {
          where: options.filter
        };
      }
    }

    if (options.include) {
      query = query || {};
      query.include = options.include;
    }


    const queryString = _.get(options, 'query-string') || _.get(options, 'meta.default-query');
    if (queryString) {
      query = query || {};
      query.query = queryString;
    }

    return query;
  }


  configureRequest(options) {
    let req = super.configureRequest(options);

    if (this.TAKE2_SECRET_KEY) {
      req = req.set('Authorization', 'Bearer ' + this.TAKE2_SECRET_KEY);
    }

    const query = this.configureQuery(options);

    // req.set('accept-encoding', 'identity');
    
    if (query) {
      return req.query(query);
    } else {
      return req;
    }
  }


  fetch(options) {
    const apiHost = this.TAKE2_API_HOST;
    
    if (options.type === 'group') {
      options.path = apiHost + '/groups';
    } else {
      options.path = apiHost + `/${options.type}`;
    }

    if (options.id) {
      options.path = options.path + `/${options.id}`;
    }

    return super.fetch(options);
  }

}

