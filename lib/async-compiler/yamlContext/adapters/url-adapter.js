import BaseAdapter from './base-adapter.js';


export default class extends BaseAdapter {

  constructor(options) {
    super(options);
    this.request = options.request;
    this.REQUIRED_OPTIONS.push('path');
  }

  
  fetch(options) {
    return this.validateOptions(options)
      .then(() => {
        return this.request
          .get(options.path);
      })
      .then(res => {
        let context = {};
        context[options.as] = {
          path: options.path,
          response: res.body
        };

        return context;
      });
  }

}
