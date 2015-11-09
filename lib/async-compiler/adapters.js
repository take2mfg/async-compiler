import _ from 'lodash';
import URLAdapter from './adapters/url-adapter';
import Take2Adapter from './adapters/take2-adapter';

export default {
  setupDefaultAdapters(options) {
    let adapters = {};

    adapters.url   = new URLAdapter({ request: options.request });
    adapters.take2 = new Take2Adapter({
      request        : options.request,
      take2ApiHost   : _.get(options, 'context.take2.host'),
      take2SecretKey : _.get(options, 'context.take2.key')
    });

    return adapters;
  }
};
