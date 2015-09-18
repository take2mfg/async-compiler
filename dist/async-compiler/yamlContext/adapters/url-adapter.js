'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _baseAdapterJs = require('./base-adapter.js');

var _baseAdapterJs2 = _interopRequireDefault(_baseAdapterJs);

var _default = (function (_BaseAdapter) {
  _inherits(_default, _BaseAdapter);

  function _default(options) {
    _classCallCheck(this, _default);

    _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, options);
    this.request = options.request;
    this.REQUIRED_OPTIONS.push('path');
  }

  _createClass(_default, [{
    key: 'configureRequest',
    value: function configureRequest(options) {
      return this.request.get(options.path);
    }
  }, {
    key: 'fetch',
    value: function fetch(options) {
      var _this = this;

      return this.validateOptions(options).then(function () {
        return _this.configureRequest(options);
      }).then(function (res) {
        var context = {};
        context[options._key] = {
          path: options.path,
          response: res.body
        };

        return context;
      });
    }
  }]);

  return _default;
})(_baseAdapterJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];