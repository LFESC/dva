# 介绍
## 版本
**2.4.1**
## 读前疑问
1. `dva(opts)` 和 `app.use(hooks)` 这些 hooks 是怎么发挥作用的
2. 为何 dispatch 的 action type 要加上 namespace
3. 在一个 model 里面可否调用其它 model 的 effects 和 reducers
4. 为何 dispatch 方法能返回 promise  
5. 为何 response 的值是 query 从服务器获取到的值
```javascript
effects: {
  *fetch(_, { call, put }) {
    const response = call(query)

    put({
      type: 'save',
      payload: response
    })
  }
}
```
::: tip 提示
你可以先看完整个源码的解析然后从中找出问题的答案，可以直接跳到[解答](./answers.md)页面。
:::
## 目录
- 输出文件
  - dva
  - [dva/router](./otherApi.md#dva-router)
  - [dva/fetch](./otherApi.md#dva-fetch)
  - [dva/saga](./otherApi.md#dva-saga)
  - [dva/dynamic](./otherApi.md#dva-dynamic)
- API
  - [app = dva(ops)](./api/dva.md)
  - [app.use(hooks)](./api/core-create.md#use)
  - [app.model(model)](./api/core-create.md#model)
  - [app.unmodel(namespace)](./api/core-create.md#unmodel)
  - [app.replaceModel(model)](./api/core-create.md#replacemodel)
  - [app.router(({ history, app }) => RouterConfig)](./api/dva.md#app-router-history-app-routerconfig)
  - [app.start(selector?)](./api/dva.md#app-start)
- [解答](./answers.md)
## 注意
- 对于源码的解读我也采用模块化的方式，如果一个方法里面引用了很多其它模块的方法，我会在其对应的章节里面阐述而不会都放在本章里面累述
- 解析里面省略了 invariant 的说明
- `process.env.NODE_ENV !== 'production'` 的代码属于开发时的代码，这个我们也省略不讲 

