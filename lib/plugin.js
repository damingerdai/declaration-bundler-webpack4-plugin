"use strict";
var DeclarationBundlerPlugin = /** @class */ (function () {
    function DeclarationBundlerPlugin(options) {
        if (options.moduleName) {
            this.out = options.out || './dist/',
                this.excludedReferences = options.excludedReferences || [];
            this.moduleName = options.moduleName;
        }
        else {
            throw new Error('please set a moduleName if you use mode:internal. new DacoreWebpackPlugin({mode:\'internal\',moduleName:...})');
        }
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
        var output = 'declare module ' + this.moduleName + '\n{\n' + declarations + '}';
        return output;
    };
    return DeclarationBundlerPlugin;
}());
module.exports = DeclarationBundlerPlugin;
