import AWS from 'aws-sdk';
import _ from 'lodash';
import RSVP from 'rsvp';

import S3Template from './async-compiler/s3Template';
import YAMLContext from './async-compiler/yamlContext';

let request = require('superagent-promise')(require('superagent'), Promise);


class AsyncCompiler {

  constructor(options) {
    options = _.extend({
      s3KeyId: '',
      s3AccessKey: '',
      defaultBucket: '',

      baseFolder: '',

      yamlFileName: 'index.yaml',

      yamlContextClass: YAMLContext,
      s3TemplateClass: S3Template,

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
      request: this.request,
    });
  }


  fetchFromS3(key, bucket=this._bucket) {
    const s3 = new AWS.S3({
      accessKeyId: this.S3_KEY_ID,
      secretAccessKey: this.S3_SECRET_ACCESS_KEY
    });

    return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: bucket,
        Key: `${this.baseFolder}/${key}`
      }, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }


  fetchCompileAndMerge(pageSlug) {
    let context = this.yamlContext.getYAMLContextFor(pageSlug);
    let template = this.s3Template.fetchTemplateFor(pageSlug);
    return RSVP.hash({
        context,
        template,
        pageSlug
      })
      .then(hash => {
        return hash.template(hash.context);
      });
  }

}


export {
  S3Template,
  YAMLContext
};


export default AsyncCompiler;