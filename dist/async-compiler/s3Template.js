'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;
var _slice = Array.prototype.slice;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

// Magic json hightlight
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

_handlebars2['default'].registerHelper('json', function (context) {
  return syntaxHighlight(context);
});

_handlebars2['default'].registerHelper('log', function (context) {
  return console.log(context.category);
});

var S3Template = (function () {
  function S3Template(options) {
    _classCallCheck(this, S3Template);

    this.request = options.request;
    this._compiler = options.compiler;
    this.fetchFromS3 = options.fetchFromS3;
  }

  _createClass(S3Template, [{
    key: 'fetchTemplateFor',
    value: function fetchTemplateFor(pageSlug) {
      return this._compiler.fetchFromS3(pageSlug + '.hbs').then(function (res) {
        var body = res.Body;

        if (body instanceof Buffer) {
          body = body.toString('utf8');
        }

        return S3Template.compile(body);
      });
    }
  }], [{
    key: 'compile',
    value: function compile() {
      return _handlebars2['default'].compile.apply(_handlebars2['default'], arguments);
    }
  }, {
    key: 'registerHelper',
    value: function registerHelper() {
      _handlebars2['default'].registerHelper.apply(_handlebars2['default'], arguments);
    }
  }, {
    key: 'safeString',
    value: function safeString() {
      return new (_bind.apply(_handlebars2['default'].SafeString, [null].concat(_slice.call(arguments))))();
    }
  }]);

  return S3Template;
})();

exports['default'] = S3Template;
module.exports = exports['default'];