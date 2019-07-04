---
sidebarDepth: 2
---
# dva(opts)
## 概述
创建应用，返回 dva 实例。(注：dva 支持多实例)。
## 源码地址
`dva/packages/src/index.js`
## 解析
以下就是 dva 方法的源码，通过分析我们可以看出 dva 方法内部做了以下几件事：
- 创建 app 对象
- 给 app 对象添加 router 方法
- 给 app 对象添加 start 方法  
接下来我们就去一一分析这几件事。
```javascript
import React from 'react';
import invariant from 'invariant';
import createHashHistory from 'history/createHashHistory';
import {
  routerMiddleware,
  routerReducer as routing,
} from 'react-router-redux';
import document from 'global/document';
import { Provider } from 'react-redux';
import * as core from 'dva-core';
import { isFunction } from 'dva-core/lib/utils';

export default function (opts = {}) {
  const history = opts.history || createHashHistory();
  const createOpts = {
    // ......
  };

  const app = core.create(opts, createOpts);
  const oldAppStart = app.start;
  app.router = router;
  app.start = start;
  return app;

  function router(router) {
    // ......
  }

  function start(container) {
    // ......
  }
}
```
### 创建 app 对象
创建 app 对象分为两步：
1. 设置参数
- opts: 外部传递过来的参数
  - history: 我们发现如果用户没有传递 history 对象，则会创建一个 hash history
- createOpts
  - initialReducer: 初始的 reducer，这里默认包含了 `react-router-redux` 的 reducer
  - setupMiddlewares: 设置中间件，预设了 [routerMiddleware](https://github.com/reactjs/react-router-redux#what-if-i-want-to-issue-navigation-events-via-redux-actions) 中间件
  - setupApp: 设置了 app._history 为 patchHistory(history) 的返回值，尚未看懂这个方法的目的是什么
2. 将参数传递给 core.create 方法，该方法最终返回的就是 app 对象
::: tip 提示
- 关于 core.create 的相关内容可以去看[这篇文章](./core-create.md)。
- 通过 core.create 创建的 app 对象本身有一个 start 方法，但是这个方法并不是最终对外暴露的方法，下面的 start 方法才是对外暴露的方法，它会覆盖原有的 start 方法
:::
```javascript
const history = opts.history || createHashHistory();
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

const app = core.create(opts, createOpts);

function patchHistory(history) {
  const oldListen = history.listen;
  history.listen = (callback) => {
    callback(history.location);
    return oldListen.call(history, callback);
  };
  return history;
}
```
### app.router(({ history, app }) => RouterConfig)
app.router() 方法的做的事情很简单：
1. 先判断一下 router 参数是否是一个函数
2. 再将 router 赋值给 app._router
```javascript
function router(router) {
  invariant(
    isFunction(router),
    `[app.router] router should be function, but got ${typeof router}`,
  );
  app._router = router;
}
```
### app.start()
app.start() 方法做了以下几件事：
1. 判断 container 是否为字符串，如果是则通过 document.querySelector 找到元素并赋值给 container
2. 判断 container 是否是一个 html 元素
3. 如果 app._store 没有则调用 oldAppStart 方法，从上面解析 dva() 可以看出 oldAppStart 是 core.create 创建出的对象的 start 方法，该方法大概会创建一个 store 对象并赋值给 app._store
```javascript
function start(container) {
  // 允许 container 是字符串，然后用 querySelector 找元素
  if (isString(container)) {
    container = document.querySelector(container);
    invariant(
      container,
      `[app.start] container ${container} not found`,
    );
  }

  // 并且是 HTMLElement
  invariant(
    !container || isHTMLElement(container),
    `[app.start] container should be HTMLElement`,
  );

  // 路由必须提前注册
  invariant(
    app._router,
    `[app.start] router must be registered before app.start()`,
  );

  if (!app._store) {
    oldAppStart.call(app);
  }
  const store = app._store;

  // export _getProvider for HMR
  // ref: https://github.com/dvajs/dva/issues/469
  app._getProvider = getProvider.bind(null, store, app);

  // If has container, render; else, return react component
  if (container) {
    render(container, store, app, app._router);
    app._plugin.apply('onHmr')(render.bind(null, container, store, app));
  } else {
    return getProvider(store, this, this._router);
  }
}
```
4. 赋值 app._getProvider，getProvider 方法返回的是一个 react-redux 的 Provider 组件，注意这里调用 router 方法是传递了 app 和 history，这也是为什么我们在调用 app.router({ history, app }) => RouterConfig) 能获取到 history 和 app 的原因。
```javascript
function getProvider(store, app, router) {
  const DvaRoot = extraProps => (
    <Provider store={store}>
      { router({ app, history: app._history, ...extraProps }) }
    </Provider>
  );
  return DvaRoot;
}
```
5. 判断 container 是否为真，如果为真则调用 render 方法，render 方法会调用 ReactDOM.render 方法将 getProvider 方法返回的组件渲染出来。如果 container 不存在则返回 getProvider 方法返回的组件。
```javascript
function render(container, store, app, router) {
  const ReactDOM = require('react-dom');  // eslint-disable-line
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}
```
