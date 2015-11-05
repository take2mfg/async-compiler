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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rsvp = require('rsvp');

var _rsvp2 = _interopRequireDefault(_rsvp);

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
  return console.log(context);
});

var S3Template = (function () {
  function S3Template(options) {
    _classCallCheck(this, S3Template);

    this.request = options.request;
    this._compiler = options.compiler;
    this.fetchFromS3 = options.fetchFromS3;
    this.DEV_TEMPLATE_FOLDER = options.DEV_TEMPLATE_FOLDER;
  }

  _createClass(S3Template, [{
    key: 'fetchTemplateFor',
    value: function fetchTemplateFor(pageSlug) {
      var _this = this;

      if (pageSlug === '404') {
        var _ret = (function () {
          var fetch = undefined;
          var key = '404.hbs';

          if (_this.DEV_TEMPLATE_FOLDER) {
            key = _path2['default'].join(_this.DEV_TEMPLATE_FOLDER, key);
            fetch = (function () {
              return _rsvp2['default'].resolve(_fs2['default'].readFileSync(key, 'utf8'));
            }).bind(_this);
          } else {
            fetch = (function () {
              return this._compiler.fetchFromS3(key).then(function (res) {
                return res.Body;
              });
            }).bind(_this);
          }

          return {
            v: fetch().then(function (body) {
              if (body instanceof Buffer) {
                body = body.toString('utf8');
              }

              return S3Template.compile(body);
            })['catch'](function () {
              return 'Not found.';
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      var templateKey = undefined,
          categoryKey = undefined,
          checkFile = undefined,
          getTemplate = undefined,
          getCategoryTemplate = undefined;

      if (this.DEV_TEMPLATE_FOLDER) {
        templateKey = _path2['default'].join(this.DEV_TEMPLATE_FOLDER, pageSlug + '.hbs');
        categoryKey = _path2['default'].join(this.DEV_TEMPLATE_FOLDER, 'category.hbs');
        checkFile = (function () {
          return this._compiler.checkFile(templateKey);
        }).bind(this);
        getCategoryTemplate = (function () {
          return _rsvp2['default'].resolve(_fs2['default'].readFileSync(categoryKey, 'utf8'));
        }).bind(this);
        getTemplate = (function () {
          return _rsvp2['default'].resolve(_fs2['default'].readFileSync(templateKey, 'utf8'));
        }).bind(this);
      } else {
        templateKey = pageSlug + '.hbs';
        categoryKey = 'category.hbs';
        checkFile = (function () {
          return this._compiler.checkFile(templateKey);
        }).bind(this);
        getCategoryTemplate = (function () {
          return this._compiler.fetchFromS3(categoryKey).then(function (res) {
            return res.Body;
          });
        }).bind(this);
        getTemplate = (function () {
          return this._compiler.fetchFromS3(templateKey).then(function (res) {
            return res.Body;
          });
        }).bind(this);
      }

      return checkFile().then(function () {
        return getTemplate();
      })['catch'](function () {
        return getCategoryTemplate();
      }).then(function (body) {
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