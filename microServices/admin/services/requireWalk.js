var fs = require("fs");

exports.requireWalk = function (path) {
  var src = path;
  var fn = function () {
    fs.readdirSync(src).forEach(function (file) {
      var newPath = src + "/" + file;
      var stat = fs.statSync(newPath);
      if (stat.isFile()) {
        if (/(.*)\.(js$|coffee$)/.test(file)) {
          // Just require the file, don't try to invoke it
          require(newPath);
        }
      } else if (stat.isDirectory()) {
        fn(newPath);
      }
    });
  };

  return fn;
};
