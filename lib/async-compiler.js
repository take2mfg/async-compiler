import fs from 'fs';
import assert from 'assert';
import AWS from 'aws-sdk';
import _ from 'lodash';
import RSVP from 'rsvp';

import S3Template from './async-compiler/s3Template';
import YAMLContext from './async-compiler/yamlContext';

let request = require('superagent-promise')(require('superagent'), Promise);


class AsyncCompiler {

  constructor(options) {
    options = _.extend({
      s3KeyId          : '',
      s3AccessKey      : '',
      defaultBucket    : '',
      
      baseFolder       : null,
      
      yamlFileName     : 'index.yaml',
      
      yamlContextClass : YAMLContext,
      s3TemplateClass  : S3Template,
      
      request          : request
    }, options);
    
    this.S3_KEY_ID            = options.s3KeyId;
    this.S3_SECRET_ACCESS_KEY = options.s3AccessKey;
    this._bucket              = options.defaultBucket;
    this.request              = options.request;
    this.baseFolder           = options.baseFolder;

    // For development
    this.DEV_TEMPLATE_FOLDER = options.DEV_TEMPLATE_FOLDER;
    this.DEV_YAML_FILE       = options.DEV_YAML_FILE;

    // TODO: find a better way than sending compiler itself
    this.yamlContext = new options.yamlContextClass({
      compiler      : this,
      request       : this.request,
      DEV_YAML_FILE : this.DEV_YAML_FILE,
    });


    this.s3Template = new options.s3TemplateClass({
      compiler            : this,
      request             : this.request,
      DEV_TEMPLATE_FOLDER : this.DEV_TEMPLATE_FOLDER,
    });
  }

  checkFile(key, bucket=this._bucket) {
    const s3 = new AWS.S3({
      accessKeyId     : this.S3_KEY_ID,
      secretAccessKey : this.S3_SECRET_ACCESS_KEY
    });

    const filePath = this.baseFolder ? `${this.baseFolder}/${key}` : `${key}`;

    if(this.DEV_TEMPLATE_FOLDER) {
      return new Promise((resolve, reject) => {
        fs.stat(key, (err, stat) => {
          if(err || !stat.isFile()) {
            return reject({ error: err || 'Not found' });
          }
          return resolve(true);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        s3.headObject({
          Bucket : bucket,
          Key    : filePath
        }, (err, data) => {
          if(data && data.ContentType && !data.DeleteMarker) {
            return resolve(true);
          }
          return reject('Not found');
        });
      });
    }

  }


  fetchFromS3(key, bucket=this._bucket) {
    const s3 = new AWS.S3({
      accessKeyId     : this.S3_KEY_ID,
      secretAccessKey : this.S3_SECRET_ACCESS_KEY
    });

    const filePath = this.baseFolder ? `${this.baseFolder}/${key}` : `${key}`;

    return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket : bucket,
        Key    : filePath
      }, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }


  fetchCompileAndMerge(options) {
    const {
      contextKey,
      templateKey,
      fallbackTemplateKey
    } = options;

    assert(contextKey, 'Must send a contextKey.');
    assert(templateKey, 'Must send a templateKey.');

    let context  = this.yamlContext.getYAMLContextFor(contextKey);
    let template = this.s3Template.fetchTemplateFor(templateKey, fallbackTemplateKey);

    return RSVP.hash({
        context,
        template
      })
      .then(hash => {
        return hash.template(hash.context);
      })
      .catch(err => {
        console.log(`Error in fetchCompileAndMerge with options:`, options);
        console.log(`and error:`, err);
        return RSVP.reject(err);
      })
      ;
  }

}


export {
  S3Template,
  YAMLContext
};


export default AsyncCompiler;
