import URLAdapter from './url-adapter.js';


export const take2ApiHost = process.env.TAKE2_API_HOST || 'http://take2-loopback.herokuapp.com/api/v1';
export const take2PublicKey = process.env.TAKE2_PUBLIC_KEY || 'pk_somefakekey';


export default class extends URLAdapter {


  configureQuery(options) {
    let query = null;
    if (options.type === 'customizables') {
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
    
    return query;
  }


  configureRequest(options) {
    let req = super.configureRequest(options);

    if (take2PublicKey) {
      req = req.set('Authorization', 'Bearer ' + take2PublicKey);
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
    const apiHost = take2ApiHost;
    
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

