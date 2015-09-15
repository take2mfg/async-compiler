import Handlebars from 'handlebars';


Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, undefined, 2);
});


export default class S3Template {
  
  constructor(options) {
    this.request = options.request;
    this._compiler = options.compiler;
    this.fetchFromS3 = options.fetchFromS3;
  }


  fetchTemplateFor(pageSlug) {
    return this._compiler.fetchFromS3(`${pageSlug}.hbs`)
      .then(res => {
        let body = res.Body;

        if (body instanceof Buffer) {
          body = body.toString('utf8');
        }

        return Handlebars.compile(body);
      });
  }

}
