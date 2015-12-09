'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.Take2AdapterException = Take2AdapterException;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urlAdapterJs = require('./url-adapter.js');

var _urlAdapterJs2 = _interopRequireDefault(_urlAdapterJs);

function Take2AdapterException(message) {
  this.message = message;
  this.name = 'Take2AdapterException';
}

var _default = (function (_URLAdapter) {
  _inherits(_default, _URLAdapter);

  function _default(options) {
    _classCallCheck(this, _default);

    _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, options);

    if (!options.take2SecretKey) {
      throw new Take2AdapterException('Take2 key is not defined.  Cannot create adapter.');
    }

    if (!options.take2ApiHost) {
      throw new Take2AdapterException('Take2 host is not defined.  Cannot create adapter.');
    }

    this.TAKE2_SECRET_KEY = options.take2SecretKey;
    this.TAKE2_API_HOST = options.take2ApiHost;
  }

  _createClass(_default, [{
    key: 'configureQuery',
    value: function configureQuery(options) {
      var query = null;
      if (options.type === 'sellables') {
        query = query || {};
        query.filter = {
          where: {
            groupId: options.groupId
          }
        };
      } else {
        if (options.filter) {
          query = query || {};
          query.filter = {
            where: options.filter
          };
        }
      }

      if (options.include) {
        query = query || {};
        query.include = options.include;
      }

      return query;
    }
  }, {
    key: 'configureRequest',
    value: function configureRequest(options) {
      var req = _get(Object.getPrototypeOf(_default.prototype), 'configureRequest', this).call(this, options);

      if (this.TAKE2_SECRET_KEY) {
        req = req.set('Authorization', 'Bearer ' + this.TAKE2_SECRET_KEY);
      }

      var query = this.configureQuery(options);

      // req.set('accept-encoding', 'identity');

      if (query) {
        return req.query(query);
      } else {
        return req;
      }
    }
  }, {
    key: 'fetch',
    value: function fetch(options) {
      var apiHost = this.TAKE2_API_HOST;

      if (options.type === 'group') {
        options.path = apiHost + '/groups';
      } else {
        options.path = apiHost + ('/' + options.type);
      }

      if (options.id) {
        options.path = options.path + ('/' + options.id);
      }

      return _get(Object.getPrototypeOf(_default.prototype), 'fetch', this).call(this, options);
    }
  }]);

  return _default;
})(_urlAdapterJs2['default']);

exports['default'] = _default;