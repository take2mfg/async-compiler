'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.YAMLContextException = YAMLContextException;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rsvp = require('rsvp');

var _rsvp2 = _interopRequireDefault(_rsvp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _adapters = require('./adapters');

var _adapters2 = _interopRequireDefault(_adapters);

var _serializers = require('./serializers');

var _serializers2 = _interopRequireDefault(_serializers);

function YAMLContextException(message) {
  this.message = message;
  this.name = 'YAMLContextException';
}

function formatCategories(categoriesHash) {
  var categories = _lodash2['default'].compact(_lodash2['default'].map(categoriesHash, function (value, key) {

    if (!value.group) {
      return;
    }

    var category = {
      key: key,
      name: value['display-name'] || key,
      slug: value.slug || key,
      group: value.group || key
    };

    if (value.children && !_lodash2['default'].isEmpty(value.children)) {
      category.children = formatCategories(value.children);
    }

    return category;
  }));

  return categories;
}

var YAMLContext = (function () {
  function YAMLContext(options) {
    _classCallCheck(this, YAMLContext);

    this._compiler = options.compiler;
    this.adapters = options.adapters || _adapters2['default'].setupDefaultAdapters({ request: options.request });
    this.DEV_YAML_FILE = options.DEV_YAML_FILE;
    this.serializers = options.serializers || _serializers2['default'].setupDefaultSerializers({ request: options.request });
  }

  _createClass(YAMLContext, [{
    key: 'getYAMLContextFor',
    value: function getYAMLContextFor(pageSlug) {
      var _this = this;

      var yamlFilePromise = undefined;

      if (this.DEV_YAML_FILE) {
        yamlFilePromise = _rsvp2['default'].resolve(_fs2['default'].readFileSync(this.DEV_YAML_FILE, 'utf8'));
      } else {
        yamlFilePromise = this._compiler.fetchFromS3('app.yaml').then(function (data) {
          return data.Body;
        });
      }

      return yamlFilePromise.then(function (yamlString) {
        // TODO: handle case of YAMLException
        var pageSchema = _jsYaml2['default'].load(yamlString);

        return _rsvp2['default'].hash({
          pageSchema: pageSchema,
          pageContext: _this.getPageContext(pageSchema, pageSlug),
          categoryContext: _this.getCategoryContext(pageSchema, pageSlug)
        });
      }).then(function (hash) {
        var context = {};

        context = _lodash2['default'].assign(context, hash.pageSchema.site);
        context.categories = formatCategories(hash.pageSchema.categories);

        if (pageSlug !== '404') {
          if (_lodash2['default'].isUndefined(hash.pageContext) && _lodash2['default'].isUndefined(hash.categoryContext)) {
            return _rsvp2['default'].reject('Slug is not found in pages or categories.');
          }
          context = _lodash2['default'].assign(context, hash.categoryContext);
          context = _lodash2['default'].assign(context, hash.pageContext);
        }

        return context;
      });
    }
  }, {
    key: 'getPageContext',
    value: function getPageContext(pageSchema, pageSlug) {
      var _this2 = this;

      var pageSlugParts = pageSlug.split('/');
      var pageDefinitionInPages = _lodash2['default'].get(pageSchema.pages, pageSlugParts);

      if (!pageDefinitionInPages) {
        return _rsvp2['default'].resolve();
      }

      // get adapters and start fetching
      var adapterPromises = _lodash2['default'].map(pageDefinitionInPages.needs, function (options, key) {
        var adapterName = options.adapter;
        var adapter = _this2.getAdapterFor(adapterName);
        var serializer = _this2.getSerializerFor(adapterName);

        if (!adapter) {
          throw new YAMLContextException('No adapter found for ' + adapterName);
        }

        // include definition key in options
        options._key = key;

        return adapter.fetch(options).then(function (_ref) {
          var response = _ref.response;
          var options = _ref.options;
          return serializer.normalize(response, options);
        });
      });

      // call all adapters in parallel
      return _rsvp2['default'].all(adapterPromises).then(function (adapterResuls) {
        // make adapterResults into a hash
        return _lodash2['default'].assign.apply(_lodash2['default'], [{}].concat(_toConsumableArray(adapterResuls)));
      });
    }
  }, {
    key: 'getAdapterFor',
    value: function getAdapterFor(typeName) {
      return _lodash2['default'].find(this.adapters, function (v, k) {
        return k === typeName;
      });
    }
  }, {
    key: 'getSerializerFor',
    value: function getSerializerFor(typeName) {
      return _lodash2['default'].find(this.serializers, function (v, k) {
        return k === typeName;
      }) || this.serializers.base;
    }
  }, {
    key: 'getCategoryContext',
    value: function getCategoryContext(pageSchema, pageSlug) {
      var pageSlugParts = pageSlug.split('/');

      // Add `children` path between slugParts to support children in nested categories
      var pageSchemePath = _lodash2['default'].reduce(_lodash2['default'].slice(pageSlugParts, 1), function (pathArray, n) {
        pathArray.push('children');
        pathArray.push(n);
        return pathArray;
      }, _lodash2['default'].slice(pageSlugParts, 0, 1));

      var categoryDefinitionInPages = _lodash2['default'].cloneDeep(_lodash2['default'].get(pageSchema.categories, pageSchemePath));

      if (!categoryDefinitionInPages) {
        return _rsvp2['default'].resolve();
      }

      var adapter = this.getAdapterFor('take2');
      var serializer = this.getSerializerFor('productTemplateGroup');

      // TODO: improve take2 adapter api so this doesn't have to be manual
      var options = categoryDefinitionInPages;
      options._key = pageSlug;
      options.adapter = 'take2';
      options.slug = categoryDefinitionInPages.group;
      options.groupId = categoryDefinitionInPages.groupId;
      options.type = 'customizables';

      return adapter.fetch(options).then(function (_ref2) {
        var response = _ref2.response;
        var options = _ref2.options;
        return serializer.normalize(response, options);
      }).then(function (category) {
        var context = {
          category: categoryDefinitionInPages
        };

        // TODO: improve take2 adapter api so this doesn't have to be manual
        context.category.response = category[pageSlug].response;

        return context;
      });
    }
  }]);

  return YAMLContext;
})();

exports['default'] = YAMLContext;