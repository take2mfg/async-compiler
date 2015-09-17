var esTranspiler = require('broccoli-babel-transpiler');
var pkg = require('./package.json');

var src = './lib';

var js = esTranspiler(src, {
  // stage: 0,

  // Transforms /index.js files to use their containing directory name
  getModuleId: function (name) { 
    name = pkg.name + '/' + name;
    return name.replace(/\/index$/, '');
  },

  // Fix relative imports inside /index's
  resolveModuleSource: function (source, filename) {
    var match = filename.match(/(.+)\/index\.\S+$/i);

    // is this an import inside an /index file?
    if (match) {
      var path = match[1];
      return source
        .replace(/^\.\//, path + '/')
        .replace(/^\.\.\//, '');
    } else {
      return source;
    }
  }
});

module.exports = js;
