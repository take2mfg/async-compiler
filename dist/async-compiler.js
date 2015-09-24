'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rsvp = require('rsvp');

var _rsvp2 = _interopRequireDefault(_rsvp);

var _asyncCompilerS3Template = require('./async-compiler/s3Template');

var _asyncCompilerS3Template2 = _interopRequireDefault(_asyncCompilerS3Template);

var _asyncCompilerYamlContext = require('./async-compiler/yamlContext');

var _asyncCompilerYamlContext2 = _interopRequireDefault(_asyncCompilerYamlContext);

var request = require('superagent-promise')(require('superagent'), Promise);

var AsyncCompiler = (function () {
  function AsyncCompiler(options) {
    _classCallCheck(this, AsyncCompiler);

    options = _lodash2['default'].extend({
      s3KeyId: '',
      s3AccessKey: '',
      defaultBucket: '',

      baseFolder: null,

      yamlFileName: 'index.yaml',

      yamlContextClass: _asyncCompilerYamlContext2['default'],
      s3TemplateClass: _asyncCompilerS3Template2['default'],

      request: request
    }, options);

    this.S3_KEY_ID = options.s3KeyId;
    this.S3_SECRET_ACCESS_KEY = options.s3AccessKey;
    this._bucket = options.defaultBucket;
    this.request = options.request;
    this.baseFolder = options.baseFolder;

    // TODO: find a better way than sending compiler itself
    this.yamlContext = new options.yamlContextClass({
      compiler: this,
      request: this.request
    });

    this.s3Template = new options.s3TemplateClass({
      compiler: this,
      request: this.request
    });
  }

  _createClass(AsyncCompiler, [{
    key: 'fetchFromS3',
    value: function fetchFromS3(key) {
      var bucket = arguments.length <= 1 || arguments[1] === undefined ? this._bucket : arguments[1];

      var s3 = new _awsSdk2['default'].S3({
        accessKeyId: this.S3_KEY_ID,
        secretAccessKey: this.S3_SECRET_ACCESS_KEY
      });

      var filePath = this.baseFolder ? this.baseFolder + '/' + key : '' + key;

      return new Promise(function (resolve, reject) {
        s3.getObject({
          Bucket: bucket,
          Key: filePath
        }, function (err, data) {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    }
  }, {
    key: 'fetchCompileAndMerge',
    value: function fetchCompileAndMerge(pageSlug) {
      var context = this.yamlContext.getYAMLContextFor(pageSlug);
      var template = this.s3Template.fetchTemplateFor(pageSlug);
      return _rsvp2['default'].hash({
        context: context,
        template: template,
        pageSlug: pageSlug
      }).then(function (hash) {
        return hash.template(hash.context);
      });
    }
  }]);

  return AsyncCompiler;
})();

exports.S3Template = _asyncCompilerS3Template2['default'];
exports.YAMLContext = _asyncCompilerYamlContext2['default'];
exports['default'] = AsyncCompiler;