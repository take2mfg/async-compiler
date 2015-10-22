import yaml from 'js-yaml';
import _ from 'lodash';
import RSVP from 'rsvp';
import fs from 'fs';

import Adapters from './adapters';
import Serializers from './serializers';


export function YAMLContextException(message) {
  this.message = message;
  this.name = 'YAMLContextException';
}

function formatCategories(categoriesHash) {
  let categories = _.compact(_.map(categoriesHash, (value, key) => {

    if(!value.group) {
      return;
    }

    let category = {
      key   : key,
      name  : value['display-name'] || key,
      slug  : value['slug'] || key,
      group : value['group'] || key
    };

    if(value.children && !_.isEmpty(value.children)) {
      category.children = formatCategories(value.children);
    }

    return category;
  }));

  return categories;
}


export default class YAMLContext {

  constructor(options) {
    this._compiler     = options.compiler;
    this.adapters      = options.adapters || Adapters.setupDefaultAdapters({ request: options.request });
    this.DEV_YAML_FILE = options.DEV_YAML_FILE;
    this.serializers   = options.serializers || Serializers.setupDefaultSerializers({ request: options.request });
  }


  getYAMLContextFor(pageSlug) {
    let yamlFilePromise;

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
          pageContext     : this.getPageContext(pageSchema, pageSlug),
          categoryContext : this.getCategoryContext(pageSchema, pageSlug)
        });
      })
      .then(hash => {
        let context = {};

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


  getPageContext(pageSchema, pageSlug) {
    const pageSlugParts         = pageSlug.split('/');
    const pageDefinitionInPages = _.get(pageSchema.pages, pageSlugParts);

    if (!pageDefinitionInPages) {
      return RSVP.resolve();
    }

    // get adapters and start fetching
    let adapterPromises = _.map(pageDefinitionInPages.needs, (options, key) => {
      const adapterName = options.adapter;
      const adapter     = this.getAdapterFor(adapterName);
      const serializer  = this.getSerializerFor(adapterName);

      if (!adapter) {
        throw new YAMLContextException(`No adapter found for ${adapterName}`);
      }

      // include definition key in options
      options._key = key;
      
      return adapter.fetch(options)
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


  getCategoryContext(pageSchema, pageSlug) {
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
    let options     = categoryDefinitionInPages;
    options._key    = pageSlug;
    options.adapter = 'take2';
    options.slug    = categoryDefinitionInPages['group'];
    options.type    = 'productTemplatePairs';

    return adapter.fetch(options)
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
