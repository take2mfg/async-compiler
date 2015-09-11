import URLAdapter from './url-adapter.js';


export default class extends URLAdapter {


  configureRequest(options) {
    return super.configureRequest(options)
      .query({
        filter: {
          templateGroup: options.slug
        },
        include: 'template,product,face'
      });
  }


  fetch(options) {
    const apiHost = 'http://take2-dev.herokuapp.com/api/1';
    
    if (options.type === 'group') {
      options.path = apiHost + '/productTemplatePairs';
    }

    return super.fetch(options);
  }

}
