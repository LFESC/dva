---
sidebarDepth: 2
---
# middlewares
## 概述
在 [dva(opts)](./dva.md) 方法中调用 [createStore](./createStore.md) 创建 redux store 时设置了一些 middlewares，这些 middlewares 有 routerMiddleware promiseMiddleware sagaMiddleware 和 extraMiddlewares，接下来我们就来解析一下这些 middlewares。
## 源码地址
- `dva/packages/dva/src/index.js`
- `dva/packages/dva-core/src/index.js`
- `dva/packages/dva-core/src/createStore.js`
- `dva/packages/dva-core/src/createPromiseMiddleware.js`
## 解析
### routerMiddleware
[routerMiddleware](https://github.com/reactjs/react-router-redux#what-if-i-want-to-issue-navigation-events-via-redux-actions) 是 react-router-redux 提供的 API 其目的是为了能够像 redux dispatch action 的形式去调用 history 的 push replace 等方法，因为是第三方库的 middleware 所以我们不做深究。
### promiseMiddleware
promiseMiddleware 是 dva 内部自己实现的一个 middleware，它的作用是当 dispatch 一个 effects action 时返回一个 promise。它是通过 createPromiseMiddleware 方法实现的，我们下面就来分析一下这个方法。
- 主体部分就是一个 `() => next => action => {}` 这样一种形式，这也是 redux 规定的 middleware 的形式
- 调用 isEffect 方法对 type 进行判断，isEffect 方法能够判断该 action 是否属于 effects 里面定义的 action
- 如果是则返回一个 promise，并调用 next 方法，除了将 action 传入之外还传递了 __dva_resolve 和 __dva_reject 这两个方法指向的就是 resolve 和 reject 用来控制 promise 的状态
- 如果 dispatch 的不是一个 effect 则直接返回 next(action)
::: tip 提示
__dva_resolve 和 __dva_reject 的调用在 [getSaga](./getSaga.md) 里面
:::
```javascript
export default function createPromiseMiddleware(app) {
  return () => next => action => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
        next({
          __dva_resolve: resolve,
          __dva_reject: reject,
          ...action,
        });
      });
    } else {
      return next(action);
    }
  };

  function isEffect(type) {
    if (!type || typeof type !== 'string') return false;
    const [namespace] = type.split(NAMESPACE_SEP);
    const model = app._models.filter(m => m.namespace === namespace)[0];
    if (model) {
      if (model.effects && model.effects[type]) {
        return true;
      }
    }

    return false;
  }
}
```
### sagaMiddleware
sagaMiddleware 是 redux-saga 的 API [createSagaMiddleware](https://redux-saga.js.org/docs/api/createsagamiddlewareoptions) 创建的用于连接 saga 到 redux store。
### extraMiddlewares
extraMiddlewares 是通过 `plugin.get('onAction')` 创建的，具体详情我们放到 [plugin](./plugin.md) 这一篇里去讲。
