"use strict";
var DeclarationBundlerPlugin = /** @class */ (function () {
    function DeclarationBundlerPlugin(options) {
        this.out = options.out || './dist/',
            this.excludedReferences = options.excludedReferences || [];
        this.importModels = options.importModels || [];
    }
    DeclarationBundlerPlugin.prototype.apply = function (compiler) {
        var _this = this;
        //when the compiler is ready to emit files
        compiler.hooks.emit.tapAsync('DeclarationBundlerWebpack4Plugin', function (compilation, callback) {
            //collect all generated declaration files
            //and remove them from the assets that will be emited
            var declarationFiles = {};
            for (var filename in compilation.assets) {
                if (filename.indexOf('.d.ts') !== -1) {
                    declarationFiles[filename] = compilation.assets[filename];
                    delete compilation.assets[filename];
                }
            }
            //combine them into one declaration file
            var combinedDeclaration = _this.generateCombinedDeclaration(declarationFiles);
            //and insert that back into the assets
            compilation.assets[_this.out] = {
                source: function () {
                    return combinedDeclaration;
                },
                size: function () {
                    return combinedDeclaration.length;
                }
            };
            //webpack may continue now
            callback();
        });
    };
    DeclarationBundlerPlugin.prototype.generateCombinedDeclaration = function (declarationFiles) {
        var regExp = /import ([\{A-Za-z0-9 ,\}]+)/;
        if (this.importModels && this.importModels.length > 0) {
            regExp = new RegExp("import ([\{A-Za-z0-9 ,\}]+) '(" + this.importModels.join('|') + ")'");
        }
        var importLines = [];
        var declarations = '';
        for (var fileName in declarationFiles) {
            var declarationFile = declarationFiles[fileName];
            var data = declarationFile.source();
            var lines = data.split('\n');
            var i = lines.length;
            var _loop_1 = function () {
                var line = lines[i];
                //exclude empty lines
                var excludeLine = line === '';
                //exclude export statements
                excludeLine = excludeLine || line.indexOf('export =') !== -1;
                //exclude import statements;
                excludeLine = excludeLine || (/import ([a-z0-9A-Z_-]+) = require\(/).test(line);
                var b = regExp.test(line);
                excludeLine = excludeLine || regExp.test(line);
                if (b) {
                    importLines.push(line);
                }
                //if defined, check for excluded references
                if (!excludeLine && this_1.excludedReferences && line.indexOf('<reference') !== -1) {
                    excludeLine = this_1.excludedReferences.some(function (reference) { return line.indexOf(reference) !== -1; });
                }
                if (excludeLine) {
                    lines.splice(i, 1);
                }
                else {
                    if (line.indexOf('declare ') !== -1) {
                        lines[i] = line.replace('declare ', '');
                    }
                    //add tab
                    lines[i] = '\t' + lines[i];
                }
            };
            var this_1 = this;
            while (i--) {
                _loop_1();
            }
            declarations += lines.join('\n') + '\n\n';
        }
        return importLines.join('\n') + '\n\n' + declarations;
    };
    return DeclarationBundlerPlugin;
}());
module.exports = DeclarationBundlerPlugin;
