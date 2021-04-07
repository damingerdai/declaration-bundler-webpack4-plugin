interface DeclarationBundler {
    out?: string;
    mode?: string;
    importModules?: string[];
    excludedReferences?: string[];
}
interface IDeclarationBundlerPlugin {
    out: string;
    excludedReferences: string[];
    importModules: string[];
    apply(compiler: any): void;
}
declare class DeclarationBundlerPlugin implements IDeclarationBundlerPlugin {
    out: string;
    excludedReferences: string[];
    importModules: string[];
    constructor(options: DeclarationBundler);
    apply(compiler: any): void;
    private generateCombinedDeclaration;
}
export = DeclarationBundlerPlugin;
