import yaml from 'js-yaml';
import _ from 'lodash';
import RSVP from 'rsvp';

import Adapters from './yamlContext/adapters';


export function YAMLContextException(message) {
  this.message = message;
  this.name = 'YAMLContextException';
}


export default class YAMLContext {

  constructor(options) {
    this._compiler = options.compiler;
    this.adapters = options.adapters || Adapters.setupDefaultAdapters({ request: options.request });
  }


  getYAMLContextFor(pageSlug) {
    return this._compiler.fetchFromS3('app.yaml')
      .then(data => {
        // TODO: handle case of YAMLException
        const pageSchema = yaml.load(data.Body);

        return RSVP.hash({
          pageSchema,
          
          pageContext: this.getPageContext(pageSchema, pageSlug),
          categoryContext: this.getCategoryContext(pageSchema, pageSlug)
        });
      })
      .then(hash => {
        let context = {};

        context = _.assign(context, hash.pageSchema.site);
        context = _.assign(context, hash.categoryContext);
        context = _.assign(context, hash.pageContext);

        return context;
      })
      ;
  }


  getPageContext(pageSchema, pageSlug) {
    const pageDefinitionInPages = _.find(pageSchema.pages, (value, key) => key === pageSlug);

    if (!pageDefinitionInPages) {
      return RSVP.resolve();
    }

    // get adapters and start fetching
    let adapterPromises = _.map(pageDefinitionInPages.needs, (options, key) => {
      const adapterName = options.adapter;
      const adapter = this.getAdapterFor(adapterName);
      if (!adapter) {
        throw new YAMLContextException(`No adapter found for ${adapterName}`);
      }

      // include definition key in options
      options._key = key;
      
      return adapter.fetch(options);
    });

    // call all adapters in parallel
    return RSVP.all(adapterPromises)
      .then(adapterResuls => {        
        // make adapterResults into a hash
        return _.assign({}, ...adapterResuls);
      });
  }


  getAdapterFor(adapterName) {
    return _.find(this.adapters, (v, k) => k === adapterName);
  }


  getCategoryContext(pageSchema, pageSlug) {
    const categoryDefinitionInPages = _.find(pageSchema.categories, (value, key) => key === pageSlug);

    if (!categoryDefinitionInPages) {
      return RSVP.resolve();
    }

    const adapter = this.getAdapterFor('take2');
    
    // TODO: improve take2 adapter api so this doesn't have to be manual
    let options = categoryDefinitionInPages;
    options._key = pageSlug;
    options.adapter = 'take2';
    options.slug = categoryDefinitionInPages['template-group-slug'];
    options.type = 'productTemplatePairs';

    return adapter.fetch(options)
      .then(category => {

        // TODO: improve take2 adapter api so this doesn't have to be manual
        return {
          category: {
            // TODO: get display name from group
            'display-name': pageSlug,
            response: category[pageSlug].response
          }
        };
      });
  }

}
