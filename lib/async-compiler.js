import AWS from 'aws-sdk';
import _ from 'lodash';

import s3Template from './async-compiler/s3Template';
import YAMLContext from './async-compiler/yamlContext';

let request = require('superagent-promise')(require('superagent'), Promise);


class AsyncCompiler {

  constructor(options) {
    options = _.extend({
      s3KeyId: '',
      s3AccessKey: '',
      defaultBucket: '',

      yamlFileName: 'index.yaml',

      yamlContextClass: YAMLContext,

      request: request
    }, options);
    
    this.S3_KEY_ID = options.s3KeyId;
    this.S3_SECRET_ACCESS_KEY = options.s3AccessKey;
    this._bucket = options.defaultBucket;
    this.request = options.request;

    // TODO: find a better way than sending compiler itself
    this.yamlContext = new options.yamlContextClass({
      compiler: this,
      request: this.request
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
        Key: key
      }, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

}


export {
  s3Template,
  YAMLContext
};


export default AsyncCompiler;
