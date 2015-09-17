'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _adaptersUrlAdapter = require('./adapters/url-adapter');

var _adaptersUrlAdapter2 = _interopRequireDefault(_adaptersUrlAdapter);

var _adaptersTake2Adapter = require('./adapters/take2-adapter');

var _adaptersTake2Adapter2 = _interopRequireDefault(_adaptersTake2Adapter);

exports['default'] = {
  setupDefaultAdapters: function setupDefaultAdapters(options) {
    var adapters = {};

    adapters.url = new _adaptersUrlAdapter2['default']({ request: options.request });
    adapters.take2 = new _adaptersTake2Adapter2['default']({ request: options.request });

    return adapters;
  }
};
module.exports = exports['default'];