import AWS from 'aws-sdk';
import _ from 'lodash';

import s3Template from './async-compiler/s3Template';
import yamlContext from './async-compiler/yamlContext';


class AsyncCompiler {

  constructor(options) {
    options = _.extend({
      s3KeyId: '',
      s3AccessKey: '',
      defaultBucket: '',

      yamlFileName: 'index.yaml'
    }, options);
    
    this.S3_KEY_ID = options.s3KeyId;
    this.S3_SECRET_ACCESS_KEY = options.s3AccessKey;
    this._bucket = options.defaultBucket;
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
  yamlContext
};


export default AsyncCompiler;
