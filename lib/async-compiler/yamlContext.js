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
          pageContext: this.getPageContext(pageSchema, pageSlug),
          categoryContext: this.getCategoryContext(pageSchema, pageSlug)
        });
      })
      .then(hash => {
        // TODO: merge with categoryContext
        return hash.pageContext;
      })
      ;
  }


  getPageContext(pageSchema, pageSlug) {
    const pageDefinitionInPages = _.find(pageSchema.pages, (value, key) => key === pageSlug);

    if (!pageDefinitionInPages) {
      return RSVP.resolve();
    }


    // get adapters
    let adapterPromises = _.map(pageDefinitionInPages.needs, (options, key) => {
      const adapter = this.getAdapterFor(key);
      if (!adapter) {
        throw new YAMLContextException(`No adapter found for ${key}`);
      }
      
      // console.log('value', value);
      // console.log('key', key);
      
      return adapter.fetch(options);
    });

    // call all adapters in parallel
    return RSVP.all(adapterPromises)
      .then(adapterResuls => {
        // return their responses merged
      })
      ;

    
  }


  getAdapterFor(adapterName) {
    // TODO: get adapters from other files/allow users to customize them
    // const defaultAdapters = {
    //   url: (options) => {
    //     // TODO: implement
    //     console.log(options);
    //     return RSVP.resolve();
    //   },

    //   take2: (options) => {
    //     // TODO: implement
    //     console.log(options);
    //     return RSVP.resolve();
    //   },

    //   stripe: (options) => {
    //     // TODO: implement
    //     console.log(options);
    //     return RSVP.resolve();
    //   },
    // };
    

    return _.find(this.adapters, (v, k) => k === adapterName);
  }


  getCategoryContext(/* pageSchema, pageSlug */) {
    // TODO: Implement
    return RSVP.resolve();

    // const pageDefinition = _.find(pageSchema.categories, (value, key) => key === pageSlug);

    // if (!pageDefinition) {
    //   return RSVP.resolve();
    // }
  }

}
