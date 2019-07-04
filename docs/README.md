# 介绍
## 概述
本次对 dva 源码的解读除了传统的从 api 入手外还将引入带入问题读源码的理念，因为只有这样当读完源码之后才会有切身的收获。
另外除了 dva 的源码外还会解读一些常用的 dva 插件的源码。
## 目录
- [dva](./dva/README.md)
- 插件
  - [dva-loading](../dva-loading/README.md)
  - [dva-immer](../dva-immer/README.md)
## 注意
- 对于源码的解读我也采用模块化的方式，如果一个方法里面引用了很多其它模块的方法，我会在其对应的章节里面阐述而不会都放在本章里面累述
- 解析里面省略了 invariant 的说明
- `process.env.NODE_ENV !== 'production'` 的代码属于开发时的代码，这个我们也省略不讲 
## 相关阅读
dva 应为是对于 redux react-redux redux-saga react-router 的整合，所以如果你对于以上这些库的源码感兴趣可以看我对应源码解读：
- [react-redux](https://react-redux-source-docs.netlify.com/)
- [redux-saga](https://lfesc.github.io/redux-saga/)
