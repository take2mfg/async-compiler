import BaseAdapter from './base-adapter.js';


export default class extends BaseAdapter {

  constructor(options) {
    super(options);
    this.request = options.request;
    this.REQUIRED_OPTIONS.push('path');
  }


  configureRequest(options) {
    return this.request
      .get(options.path);
  }

  
  fetch(options) {
    return this.validateOptions(options)
      .then(() => {
        return this.configureRequest(options);
      })
      .then(res => {
        return { options, response: res.body };
      });
  }

}
