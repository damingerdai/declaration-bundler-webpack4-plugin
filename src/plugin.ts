interface DeclarationBundler {
    out?: string;
    moduleName: string;
    mode?: string;
    excludedReferences?: string[];
}

type Callback = () => void;

interface IDeclarationBundlerPlugin {
    out: string;
    moduleName: string;
    excludedReferences: string[];

    apply(compiler: any): void;
}

class DeclarationBundlerPlugin implements IDeclarationBundlerPlugin {

    out: string;
    moduleName: string;
    excludedReferences: string[];

    constructor(options: DeclarationBundler) {
        if (options.moduleName) {
            this.out = options.out || './dist/',
                this.excludedReferences = options.excludedReferences || [];
            this.moduleName = options.moduleName;
        } else {
            throw new Error('please set a moduleName if you use mode:internal. new DacoreWebpackPlugin({mode:\'internal\',moduleName:...})');
        }

    }

    apply(compiler: any): void {
        //when the compiler is ready to emit files
        compiler.hooks.emit.tapAsync('DeclarationBundlerWebpack4Plugin', (compilation: any, callback: Callback) => {
            //collect all generated declaration files
            //and remove them from the assets that will be emited
            var declarationFiles: any = {};
            for (var filename in compilation.assets) {
                if (filename.indexOf('.d.ts') !== -1) {
                    declarationFiles[filename] = compilation.assets[filename];
                    delete compilation.assets[filename];
                }

            }

            //combine them into one declaration file
            var combinedDeclaration = this.generateCombinedDeclaration(declarationFiles);
            //and insert that back into the assets
            compilation.assets[this.out] = {
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
    }

    private generateCombinedDeclaration(declarationFiles: any): string {
        let declarations = '';
        for (let fileName in declarationFiles) {
            const declarationFile = declarationFiles[fileName];
            const data = declarationFile.source();

            const lines = data.split('\n');
            let i = lines.length;

            while (i--) {
                const line = lines[i];
                //exclude empty lines
                let excludeLine = line === '';
                //exclude export statements
                excludeLine = excludeLine || line.indexOf('export =') !== -1;
                //exclude import statements;
                excludeLine = excludeLine || (/import ([a-z0-9A-Z_-]+) = require\(/).test(line);
                //if defined, check for excluded references
                if (!excludeLine && this.excludedReferences && line.indexOf('<reference') !== -1) {
                    excludeLine = this.excludedReferences.some(reference => line.indexOf(reference) !== -1);
                }

                if (excludeLine) {
                    lines.splice(i, 1);
                } else {
                    if (line.indexOf('declare ') !== -1) {
                        lines[i] = line.replace('declare ', '');
                    }
                    //add tab
					lines[i] = '\t' + lines[i];
                }
            }
            declarations += lines.join('\n') + '\n\n';
        }
        const output = 'declare module '+this.moduleName+'\n{\n' + declarations + '}';
        return output;
    }
}

export = DeclarationBundlerPlugin;