## miniprogram SDK
这是一个小程序数据埋点相关的 sdk，为了避免对原有的业务逻辑进行侵入，这套 sdk 全面采用切面编程的方式，通过大量的高阶函数包装来截取数据并进行分析上报。

+ `yarn dev` 动态打包，会生成 sourcemap， 用于开发
+ `yarn build` 不会生成 soucemap，并会打包一个压缩版本
+ `yarn open` 打开开发者工具，可能需要自己制定开发者工具的安装位置
+ `yarn test` 运行所有的单元测试用例