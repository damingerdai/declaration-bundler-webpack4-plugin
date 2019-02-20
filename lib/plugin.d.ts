interface DeclarationBundler {
    out?: string;
    mode?: string;
    importModels?: string[];
    excludedReferences?: string[];
}
interface IDeclarationBundlerPlugin {
    out: string;
    excludedReferences: string[];
    importModels: string[];
    apply(compiler: any): void;
}
declare class DeclarationBundlerPlugin implements IDeclarationBundlerPlugin {
    out: string;
    excludedReferences: string[];
    importModels: string[];
    constructor(options: DeclarationBundler);
    apply(compiler: any): void;
    private generateCombinedDeclaration;
}
export = DeclarationBundlerPlugin;
