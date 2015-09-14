// import assert from 'assert';
import Handlebars from 'handlebars';


export default class S3Template {
  
  constructor(options) {
    this.request = options.request;
    this._compiler = options.compiler;
    this.fetchFromS3 = options.fetchFromS3;
  }


  fetchTemplateFor(pageSlug) {
    return this._compiler.fetchFromS3(`${pageSlug}.hbs`)
      .then(res => {
        return Handlebars.compile(res.Body);
      });
  }

}
