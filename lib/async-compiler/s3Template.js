import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import RSVP from 'rsvp';



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
    this.request             = options.request;
    this._compiler           = options.compiler;
    this.fetchFromS3         = options.fetchFromS3;
    this.DEV_TEMPLATE_FOLDER = options.DEV_TEMPLATE_FOLDER;
  }

  fetchTemplateFor(pageSlug, fallbackTemplateKey='category') {
    if(pageSlug === '404') {
      let fetch;
      let key = '404.hbs';

      if(this.DEV_TEMPLATE_FOLDER) {
        key = path.join(this.DEV_TEMPLATE_FOLDER, key);
        fetch = function() { return RSVP.resolve(fs.readFileSync(key, 'utf8')); }.bind(this);
      } else {
        fetch = function() { return this._compiler.fetchFromS3(key).then(res => res.Body); }.bind(this);
      }
      
      return fetch()
              .then((body) => {
                if(body instanceof Buffer) {
                  body = body.toString('utf8');
                }

                return S3Template.compile(body);
              })
              .catch(() => {
                return 'Not found.';
              });
    }

    let templateKey,
        fallbackKey,
        checkFile,
        getTemplate,
        getFallbackTemplate;

    if(this.DEV_TEMPLATE_FOLDER) {
      templateKey         = path.join(this.DEV_TEMPLATE_FOLDER, `${pageSlug}.hbs`);
      fallbackKey         = path.join(this.DEV_TEMPLATE_FOLDER, `${fallbackTemplateKey}.hbs`);
      checkFile           = function() { return this._compiler.checkFile(templateKey); }.bind(this);
      getFallbackTemplate = function() { return RSVP.resolve(fs.readFileSync(fallbackKey, 'utf8')); }.bind(this);
      getTemplate         = function() { return RSVP.resolve(fs.readFileSync(templateKey, 'utf8')); }.bind(this);
    } else {
      templateKey         = `${pageSlug}.hbs`;
      fallbackKey         = `${fallbackTemplateKey}.hbs`;
      checkFile           = function() { return this._compiler.checkFile(templateKey); }.bind(this);
      getFallbackTemplate = function() { return this._compiler.fetchFromS3(fallbackKey).then(res => res.Body); }.bind(this);
      getTemplate         = function() { return this._compiler.fetchFromS3(templateKey).then(res => res.Body); }.bind(this);
    }

    return checkFile()
      .then(() => {
        return getTemplate();
      })
      .catch(() => {
        return getFallbackTemplate();
      })
      .then((body) => {
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
