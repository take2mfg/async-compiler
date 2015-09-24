'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseSerializer = require('./base-serializer');

var _baseSerializer2 = _interopRequireDefault(_baseSerializer);

var _default = (function (_BaseSerializer) {
  _inherits(_default, _BaseSerializer);

  function _default() {
    _classCallCheck(this, _default);

    _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this);
  }

  _createClass(_default, [{
    key: 'normalize',
    value: function normalize(response, options) {
      function findInRelationships(response, type, id) {
        return _lodash2['default'].find(response.included, function (item) {
          return item.type === type && '' + item.id === '' + id;
        });
      }

      function nestDataItems(response) {

        if (!response.data) {
          // No JSON API? return as is
          return response;
        }

        return _lodash2['default'].map(response.data, function (item) {
          var relationships = item.relationships;

          delete item.relationships;

          _lodash2['default'].forEach(relationships, function (value, key) {
            var relatedItem = findInRelationships(response, value.data.type, value.data.id);

            if (relatedItem) {
              item[key] = relatedItem;
            }
          });

          return item;
        });
      }

      var nestedItems = nestDataItems(response);

      var context = {};
      if (options) {
        context[options._key] = {
          path: options.path,
          response: nestedItems
        };
      } else {
        context = nestedItems;
      }

      return context;
    }
  }]);

  return _default;
})(_baseSerializer2['default']);

exports['default'] = _default;
module.exports = exports['default'];