'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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

    // For development
    this.DEV_TEMPLATE_FOLDER = options.DEV_TEMPLATE_FOLDER;
    this.DEV_YAML_FILE = options.DEV_YAML_FILE;

    var context = {
      take2: {
        key: options.take2SecretKey || null,
        host: options.take2ApiHost || null
      }
    };

    // TODO: find a better way than sending compiler itself
    this.yamlContext = new options.yamlContextClass({
      compiler: this,
      request: this.request,
      DEV_YAML_FILE: this.DEV_YAML_FILE,
      context: context
    });

    this.s3Template = new options.s3TemplateClass({
      compiler: this,
      request: this.request,
      DEV_TEMPLATE_FOLDER: this.DEV_TEMPLATE_FOLDER
    });
  }

  _createClass(AsyncCompiler, [{
    key: 'checkFile',
    value: function checkFile(key) {
      var bucket = arguments.length <= 1 || arguments[1] === undefined ? this._bucket : arguments[1];

      var s3 = new _awsSdk2['default'].S3({
        accessKeyId: this.S3_KEY_ID,
        secretAccessKey: this.S3_SECRET_ACCESS_KEY
      });

      var filePath = this.baseFolder ? this.baseFolder + '/' + key : '' + key;

      if (this.DEV_TEMPLATE_FOLDER) {
        return new Promise(function (resolve, reject) {
          _fs2['default'].stat(key, function (err, stat) {
            if (err || !stat.isFile()) {
              return reject({ error: err || 'Not found' });
            }
            return resolve(true);
          });
        });
      } else {
        return new Promise(function (resolve, reject) {
          s3.headObject({
            Bucket: bucket,
            Key: filePath
          }, function (err, data) {
            if (data && data.ContentType && !data.DeleteMarker) {
              return resolve(true);
            }
            return reject('Not found');
          });
        });
      }
    }
  }, {
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
    value: function fetchCompileAndMerge(options) {
      var contextKey = options.contextKey;
      var templateKey = options.templateKey;
      var fallbackTemplateKey = options.fallbackTemplateKey;
      var searchQuery = options.searchQuery;

      (0, _assert2['default'])(contextKey, 'Must send a contextKey.');
      (0, _assert2['default'])(templateKey, 'Must send a templateKey.');

      var context = this.yamlContext.getYAMLContextFor(contextKey, { searchQuery: searchQuery });
      var template = this.s3Template.fetchTemplateFor(templateKey, fallbackTemplateKey);

      var extras = options.extras || {};

      return _rsvp2['default'].hash({
        context: context,
        template: template
      }).then(function (hash) {
        var full_context = _lodash2['default'].merge(extras, hash.context);
        return hash.template(full_context);
      })['catch'](function (err) {
        // console.log(`Error in fetchCompileAndMerge with options:`, options);
        // console.log(`and error:`, err);
        return _rsvp2['default'].reject(err);
      });
    }
  }]);

  return AsyncCompiler;
})();

exports.S3Template = _asyncCompilerS3Template2['default'];
exports.YAMLContext = _asyncCompilerYamlContext2['default'];
exports['default'] = AsyncCompiler;