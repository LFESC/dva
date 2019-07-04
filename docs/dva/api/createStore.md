---
sidebarDepth: 2
---
# createStore
## 概述
createStore 的作用和 redux 的 createStore 方法类似，它只是在其之外做了些事情。
## 源码位置
`dva/packages/dva-core/src/createStore.js`
## 解析
通过分析源码我们把整个代码分成如下几个部分，各部对应的源码在下方用注释表明。
### 源码
```javascript
export default function({
  reducers,
  initialState,
  plugin,
  sagaMiddleware,
  promiseMiddleware,
  createOpts: { setupMiddlewares = returnSelf },
}) {
  // ------- 1. 获取并校验 extraEnhancers --------
  const extraEnhancers = plugin.get('extraEnhancers');
  invariant(
    isArray(extraEnhancers),
    `[app.start] extraEnhancers should be array, but got ${typeof extraEnhancers}`
  );

  // ------- 2. 生成 middlewares
  const extraMiddlewares = plugin.get('onAction');
  const middlewares = setupMiddlewares([
    promiseMiddleware,
    sagaMiddleware,
    ...flatten(extraMiddlewares),
  ]);

  let devtools = () => noop => noop;
  // -------- 忽略 dev 代码 ---------
  if (
    process.env.NODE_ENV !== 'production' &&
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  }

  // -------- 3. 生成 enhancers ---------
  const enhancers = [
    applyMiddleware(...middlewares),
    ...extraEnhancers,
    devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS),
  ];

  // --------- 4. 调用 redux.createStore --------
  return createStore(reducers, initialState, compose(...enhancers));
}
```
### 1. 获取并校验 extraEnhancers 
通过 [plugin](./plugin.md#get) 获取所有的 extraEnhancers 并且判断其类型是否为数组
### 2. 生成 middlewares 
通过 setupMiddlewares 生成所有的 middlewares，setupMiddlewares 是在 [dva()](./dva.md) 源码里面传过去的，我把代码放在下面了，可以看到最终返回的 middewares 数组包含：routerMiddleware promiseMiddleware sagaMiddleware extraMiddlewares
::: tip 提示
flatten 库是将一个多维数组展开为一维数组
:::
```javascript
const createOpts = {
  initialReducer: {
    routing,
  },
  setupMiddlewares(middlewares) {
    return [
      routerMiddleware(history),
      ...middlewares,
    ];
  },
  setupApp(app) {
    app._history = patchHistory(history);
  },
};
// ------- from dva/src/index.js
```
### 3. 生成 enhancers
[enhancers](https://redux.js.org/glossary#store-enhancer) 是 redux 里面的术语，用于扩展 createStore，这里生成的 enhancers 主要有三种：
  - 我们将之前生成的 middlewares 调用 [applyMiddleware](https://redux.js.org/api/applymiddleware#applymiddlewaremiddleware) 生成 enhancers
  - 之前获取的 extraEnhancers
  - devtools 在 dev 环境下如果引入了 redux-devtools 会自动引入
### 4. 调用 redux.createStore
调用 createStore 生成 store 对象并返回

