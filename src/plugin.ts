interface DeclarationBundler {
    out?: string;
    mode?: string;
    excludedReferences?: string[];
}

type Callback = () => void;

interface IDeclarationBundlerPlugin {
    out: string;
    excludedReferences: string[];

    apply(compiler: any): void;
}

class DeclarationBundlerPlugin implements IDeclarationBundlerPlugin {

    out: string;
    excludedReferences: string[];

    constructor(options: DeclarationBundler) {
        this.out = options.out || './dist/',
        this.excludedReferences = options.excludedReferences || [];
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
        return declarations;
    }
}

export = DeclarationBundlerPlugin;