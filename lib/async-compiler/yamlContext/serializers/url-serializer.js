import BaseSerializer from './base-serializer';


export default class extends BaseSerializer {

  normalize(response, options) {
    let context = {};
    if (options) {
      context[options._key] = {
        response,
        path: options.path
      };
    } else {
      context = response;
    }

    return context;
  }

}
