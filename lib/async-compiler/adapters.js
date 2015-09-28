import URLAdapter from './adapters/url-adapter';
import Take2Adapter from './adapters/take2-adapter';


export default {
  setupDefaultAdapters(options) {
    let adapters = {};

    adapters.url = new URLAdapter({ request: options.request });
    adapters.take2 = new Take2Adapter({ request: options.request });

    return adapters;
  }
};
