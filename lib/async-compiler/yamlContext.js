import yaml from 'js-yaml';
import _ from 'lodash';
import RSVP from 'rsvp';
import fs from 'fs';
import assert from 'assert';

import Adapters from './adapters';
import Serializers from './serializers';


export function YAMLContextException(message) {
  this.message = message;
  this.name = 'YAMLContextException';
}

function formatCategories(categoriesHash, parent) {
  let categories = _.compact(_.map(categoriesHash, (value, key) => {

    if(!value.group && !value.groupId) {
      // console.log('Invalid category', key, value);
      return;
    }

    const slug = value.slug || key;

    let category = {
      key  : key,
      name : value['display-name'] || key,
      slug : value.slug || key,
      url  : (parent && _.get(parent, 'url')) ? `${parent.url}/${slug}` : `/${slug}`
    };

    if (value.groupId) {
      category.groupId = value.groupId;
    } else if (value.group) {
      category.group = value.group;
    } else {
      category.group = key;
    }

    if(value.meta && _.isObject(value.meta)) {
      category.meta = value.meta;
    }
      

    if(value.children && !_.isEmpty(value.children)) {
      category.children = formatCategories(value.children, category);
    }

    return category;
  }));

  return categories;
}


export default class YAMLContext {

  constructor(options) {
    this._compiler     = options.compiler;

    let adapter_options = {
      request: _.get(options, 'request'),
      context: _.get(options, 'context')
    };

    this.adapters      = options.adapters || Adapters.setupDefaultAdapters(adapter_options);
    this.DEV_YAML_FILE = options.DEV_YAML_FILE;
    this.serializers   = options.serializers || Serializers.setupDefaultSerializers({ request: options.request });
  }


  getYAMLContextFor(pageSlug, options={}) {
    let yamlFilePromise;
    const {
      queryString,
    } = options;

    if (this.DEV_YAML_FILE) {
      yamlFilePromise = RSVP.resolve(fs.readFileSync(this.DEV_YAML_FILE, 'utf8'));
    } else {
      yamlFilePromise = this._compiler.fetchFromS3('app.yaml')
        .then(data => data.Body);
    }
    
    return yamlFilePromise
      .then(yamlString => {
        // TODO: handle case of YAMLException
        const pageSchema = yaml.load(yamlString);

        return RSVP.hash({
          pageSchema,
          pageContext     : this.getPageContext(pageSchema, pageSlug, options),
          categoryContext : this.getCategoryContext(pageSchema, pageSlug, options)
        });
      })
      .then(hash => {
        let context = {
          currentSlug: pageSlug
        };

        context            = _.assign(context, hash.pageSchema.site);
        context.categories = formatCategories(hash.pageSchema.categories);

        if(pageSlug !== '404') {
          if (_.isUndefined(hash.pageContext) && _.isUndefined(hash.categoryContext)) {
            return RSVP.reject('Slug is not found in pages or categories.');
          }
          context = _.assign(context, hash.categoryContext);
          context = _.assign(context, hash.pageContext);
        }

        return context;
      });
  }


  getPageContext(pageSchema, pageSlug, options={}) {
    const pageSlugParts         = pageSlug.split('/');
    const pageDefinitionInPages = _.get(pageSchema.pages, pageSlugParts);

    if (!pageDefinitionInPages) {
      return RSVP.resolve();
    }

    // get adapters and start fetching
    let adapterPromises = _.map(pageDefinitionInPages.needs, (adapterOptions, key) => {
      const adapterName = adapterOptions.adapter;
      const adapter     = this.getAdapterFor(adapterName);
      const serializer  = this.getSerializerFor(adapterName);

      if (!adapter) {
        throw new YAMLContextException(`No adapter found for ${adapterName}`);
      }

      // include definition key in adapterOptions
      adapterOptions._key    = key;
      adapterOptions.options = options;
      assert(adapterOptions.type !== 'group', 'Group type is not supported');
      
      return adapter.fetch(adapterOptions)
        .then(({ response, options }) =>  serializer.normalize(response, options));
    });

    // call all adapters in parallel
    return RSVP.all(adapterPromises)
      .then(adapterResuls => {        
        // make adapterResults into a hash
        return _.assign({}, ...adapterResuls);
      });
  }


  getAdapterFor(typeName) {
    return _.find(this.adapters, (v, k) => k === typeName);
  }

  getSerializerFor(typeName) {
    return _.find(this.serializers, (v, k) => k === typeName) || this.serializers.base;
  }


  getCategoryContext(pageSchema, pageSlug, options={}) {
    const pageSlugParts = pageSlug.split('/');

    // Add `children` path between slugParts to support children in nested categories
    const pageSchemePath = _.reduce(_.slice(pageSlugParts, 1), (pathArray, n) => {
      pathArray.push('children');
      pathArray.push(n);
      return pathArray;
    }, _.slice(pageSlugParts, 0, 1));

    const categoryDefinitionInPages = _.cloneDeep(_.get(pageSchema.categories, pageSchemePath));

    if (!categoryDefinitionInPages) {
      return RSVP.resolve();
    }

    const adapter = this.getAdapterFor('take2');
    const serializer = this.getSerializerFor('productTemplateGroup');

    // TODO: improve take2 adapter api so this doesn't have to be manual
    let adapterOptions     = categoryDefinitionInPages;
    adapterOptions._key    = pageSlug;
    adapterOptions.adapter = 'take2';
    adapterOptions.slug    = categoryDefinitionInPages.group;
    adapterOptions.groupId = categoryDefinitionInPages.groupId;
    adapterOptions.type    = 'sellables';
    adapterOptions.options = options;

    return adapter.fetch(adapterOptions)
      .then(({ response, options }) =>  serializer.normalize(response, options))
      .then(category => {
        let context = {
          category: categoryDefinitionInPages
        };

        // TODO: improve take2 adapter api so this doesn't have to be manual
        context.category.response = category[pageSlug].response;

        return context;
      });
  }

}
