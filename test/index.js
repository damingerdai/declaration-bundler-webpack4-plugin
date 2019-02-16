const DeclarationBundlerPlugin = require('../lib/plugin.js');
const DeclarationBundlerPlugin2 = require('../lib/plugin.min.js');

console.log(DeclarationBundlerPlugin);
console.log(new DeclarationBundlerPlugin({
    moduleName:'rxhttp',
    out:'./rxhttp.d.ts',
    excludedReferences: ['rxjs']
}));

console.log(DeclarationBundlerPlugin2);
console.log(new DeclarationBundlerPlugin2({
    moduleName:'rxhttp',
    out:'./rxhttp.d.ts',
    excludedReferences: ['rxjs']
}))