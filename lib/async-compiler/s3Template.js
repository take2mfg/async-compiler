import Handlebars from 'handlebars';


// Magic json hightlight
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}


Handlebars.registerHelper('json', function(context) {
  return syntaxHighlight(context);
});


Handlebars.registerHelper('log', function(context) {
  return console.log(context);
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

        return S3Template.compile(body);
      });
  }


  static compile() {
    return Handlebars.compile(...arguments);
  }


  static registerHelper() {
    Handlebars.registerHelper(...arguments);
  }


  static safeString() {
    return new Handlebars.SafeString(...arguments);
  }

}
