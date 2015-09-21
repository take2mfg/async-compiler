import URLAdapter from './url-adapter.js';


export const take2ApiHost = process.env.TAKE2_API_HOST || 'http://take2-dev.herokuapp.com/api/v1';
export const take2PublicKey = process.env.TAKE2_PUBLIC_KEY || 'pk_somefakekey';


export default class extends URLAdapter {


  configureQuery(options) {
    let query = {};
    if (options.type === 'group' || options.type === 'productTemplatePairs') {
      query.filter = { templateGroup: options.slug };
      query.include = 'template,product,face';
    } else {
      query.include = options.include;
      query.filter = options.filter;
    }
    
    return query;
  }


  configureRequest(options) {
    let req = super.configureRequest(options);

    if (take2PublicKey) {
      req = req.set('Authorization', 'bearer ' + take2PublicKey);
    }

    const query = this.configureQuery(options);

    // req.set('accept-encoding', 'identity');
    
    return req.query(query);
  }


  fetch(options) {
    const apiHost = take2ApiHost;
    
    if (options.type === 'group') {
      options.path = apiHost + '/productTemplatePairs';
    } else {
      options.path = apiHost + `/${options.type}`;
    }

    if (options.id) {
      options.path = options.path + `/${options.id}`;
    }

    return super.fetch(options);
  }

}

