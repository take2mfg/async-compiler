import URLAdapter from './adapters/url-adapter';
import Take2Adapter from './adapters/take2-adapter';


export default {
  setupDefaultAdapters() {
    let adapters = {};

    adapters.url = new URLAdapter();
    adapters.take2 = new Take2Adapter();

    return adapters;
  }
};
