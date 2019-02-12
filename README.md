# declaration-bundler-webpack4-plugin
declaration-bundler-webpack4-plugin

# 描述
该库获取由webpack构建过程生成的单独声明资产文件，并将它们捆绑到一个单独的声明文件中。但是，它通过重新组合单独的声明来实现，就好像所有类和接口都被定义为 __内部模块__ 一样。因此，如果您自己将类和接口公开给全局模块空间，那么使用此插件才有意义。

## 警告
这是一个有趣的设置，你可能只想使用内部模块或外部模块，然后这个库将没有用，除了作为灵感来制作另一个组合声明文件的插件。

## 什么时候使用这个
该插件具有如下设置，允许外部模块模仿内部模块。创建的用例是将模块加载到单独的文件中，同时还能够将前缀URI（如foaf：Image）映射回模块路径（my.modules.rdfs.Image）。只有在极少数情况下你想做类似的事情，这可能会有所帮助。

# 选项：
1. out：应该保存组合声明文件的路径。
2. moduleName：要生成的内部模块的名称
3. excludedReferences：一个数组，您希望从最终声明文件中排除引用。

# 要求：
这个插件是作为[ts-loader](https://github.com/TypeStrong/ts-loader)的扩展而开发的, 当`declaration`设置为-时 `true`，`tsconfig.json`为每个源文件生成单独的声明文件。理论上，它应该与任何生成声明文件作为输出的加载器一起使用。

以下是一个示例设置：

    //init.ts
    import Foo = require('./foo');
    import Foo2 = require('./foo2');
    var register:Function = (function()
    {
        some.path['moduleName'] = {
            "Foo": Foo,
            "Foo2" : Foo2,
        }
        return function(){};
    })();
    export = register;
    
    //foo.ts
    export class Foo {
        bar():boolean { return true; }
    }
    
    //foo2.ts
    import Foo = require('./foo');
    export class Foo2 extends Foo {
        bar():boolean { return true; }
    }

生成（当使用typescript编译器的declaration = true标志时）

    //init.d.ts
    var register: Function;
    export = register;
    
    //foo.d.ts
    declare class Foo {
        bar():boolean;
    }
    export = Foo;
    
    //foo2.d.ts
    import Foo = require('./foo');
    declare class Foo2 extends Foo{
        bar():boolean;
    }
    export = Foo2;

其中包含以下webpack.config.js

    var DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');
    module.exports = {
        entry: './src/init.ts',
        output: {
            filename: './builds/bundle.js'
        },
        resolve: {
            extensions: ['', '.ts', '.tsx','.webpack.js', '.web.js', '.js']
        },
        module: {
            loaders: [
                { test: /\.ts(x?)$/, loader: 'ts-loader' }
            ]
        },
        watch:true,
        plugins: [
            new DeclarationBundlerPlugin({
                moduleName:'some.path.moduleName',
                out:'./builds/bundle.d.ts',
            })
        ]
    }

将变成：
    //bundle.d.ts
    declare module some.path.moduleName {
    
        var register: Function;
    
        class Foo {
            bar():boolean;
        }
    
        class Foo2 extends Foo {
            bar():boolean;
        }
    }

使用此设置和生成的声明文件，其他想要使用此模块的模块可以添加对生成的bundle.d.ts的引用。然后，他们可以访问模块的所有类，就好像它们是在全局路径中定义的一样，如内部打字稿模块：

    ///<reference path="path/to/bundle.d.ts" />
    var foo:some.path.moduleName.Foo = new some.path.moduleName.Foo();
当您最终在浏览器中加载bundle.js时，将自动调用register函数，这将使类在全局模块路径中可用，以便其他模块可以按照它们从声明文件中所期望的那样访问类。