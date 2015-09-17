'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.YAMLContextAdapterException = YAMLContextAdapterException;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rsvp = require('rsvp');

var _rsvp2 = _interopRequireDefault(_rsvp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function YAMLContextAdapterException(message) {
  this.message = message;
  this.name = 'YAMLContextAdapterException';
}

var _default = (function () {
  function _default() {
    _classCallCheck(this, _default);

    this.REQUIRED_OPTIONS = ['adapter'];
  }

  _createClass(_default, [{
    key: 'validateOptions',
    value: function validateOptions(options) {
      var errorMessages = [];

      _lodash2['default'].forEach(this.REQUIRED_OPTIONS, function (optionName) {
        if (!options[optionName]) {
          errorMessages.push('\'' + optionName + '\' option is required.');
        }
      });

      if (errorMessages.length > 0) {
        return _rsvp2['default'].reject(errorMessages.join(' '));
      }

      return _rsvp2['default'].resolve(options);
    }
  }, {
    key: 'fetch',
    value: function fetch(options) {
      return this.validateOptions(options);
    }
  }]);

  return _default;
})();

exports['default'] = _default;