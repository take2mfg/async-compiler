import URLAdapter from './url-adapter.js';


const take2ApiHost = process.env.TAKE2_API_HOST || 'http://take2-dev.herokuapp.com/api/v1';
const take2PublicKey = process.env.TAKE2_PUBLIC_KEY || 'pk_somefakekey';


export default class extends URLAdapter {

  configureRequest(options) {
    let req = super.configureRequest(options);

    if (take2PublicKey) {
      req = req.set('Authorization', 'bearer ' + take2PublicKey);
    }
      
    return req.query({
        filter: {
          templateGroup: options.slug
        },
        include: 'template,product,face'
      });
  }


  fetch(options) {
    const apiHost = take2ApiHost;
    
    if (options.type === 'group') {
      options.path = apiHost + '/productTemplatePairs';
    } else {
      options.path = apiHost + `/${options.type}`;
    }

    return super.fetch(options);
  }

}
