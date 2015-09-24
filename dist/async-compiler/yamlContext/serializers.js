'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _serializersBaseSerializer = require('./serializers/base-serializer');

var _serializersBaseSerializer2 = _interopRequireDefault(_serializersBaseSerializer);

var _serializersUrlSerializer = require('./serializers/url-serializer');

var _serializersUrlSerializer2 = _interopRequireDefault(_serializersUrlSerializer);

var _serializersTake2Serializer = require('./serializers/take2-serializer');

var _serializersTake2Serializer2 = _interopRequireDefault(_serializersTake2Serializer);

var _serializersProductTemplateGroupSerializer = require('./serializers/product-template-group-serializer');

var _serializersProductTemplateGroupSerializer2 = _interopRequireDefault(_serializersProductTemplateGroupSerializer);

exports['default'] = {
  setupDefaultSerializers: function setupDefaultSerializers(options) {
    var serializers = {};

    serializers.base = new _serializersBaseSerializer2['default']({ request: options.request });
    serializers.productTemplateGroup = new _serializersProductTemplateGroupSerializer2['default']({ request: options.request });
    serializers.url = new _serializersUrlSerializer2['default']({ request: options.request });
    serializers.take2 = new _serializersTake2Serializer2['default']({ request: options.request });

    return serializers;
  }
};
module.exports = exports['default'];