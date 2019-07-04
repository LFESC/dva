# 解答
## 1. `dva(opts)` 和 `app.use(hooks)` 这些 hooks 是怎么发挥作用的  
- onError: onError 会在 model.effects 执行的时候去处理捕获的错误，还有就是作为 subscription 的第二个参数，可以手动调用。涉及的源码有 [getSaga](./api/getSaga.md#getwatcher) 和 [subscription](./api/subscription.md#run)
- onAction: onAction 其实就是 redux 的 middleware，所以它在 [createStore](./api/createStore.md) 生成 middleware 的时候调用
- onStateChange: onStateChange 会在 `core.create()` 生成的 app 对象的 [start](./api/core-create.md#start) 方法里面调用，dva 会调用 store.subscribe 设置 store 改变时的监听器，这个监听器就是 onStateChange
- onReducer: onReducer 用来封装 reducer，它接收整个 reducer 方法，你可以在调用 reducer 前后做一些事情，它是在 [createReducer](./api/core-create.md#其它) 方法生成 reducer 的时候调用的 
- onEffect: onEffect 是在执行 saga 时调用的，在 [sagaWithOnEffect](./api/getSaga.md#getwatcher) 这个方法里面调用 onEffect，把真正的 effect model action 做为参数传给 onEffect，这样你就可以自定义 effect 的执行 
- extraReducers: extraReducers 是在 [createReducer](./api/core-create.md#其它) 里面调用的，这个方法会将内置的 reducer 和 额外的 reducers(extraReducers) 通过 combineReducers 方法合并为一个 reducer；createReducer 会在 app.start app.model app.unmodel app.replaceModel 这几个 api 里面调用
- _handleActions: 这个文档里面没有提到，我也是看了源码才知道，它的作用是替代默认的 [handleActions](./api/handleActions.md) 来生成 reducer，目前我知道只有 [dva-immer](../dva-immer/README.md) 里面用到了
## 2. 为何 dispatch 的 action type 要加上 namespace
在我们调用 app.model(m) 时会进入 [model](./api/core-create.md#model) 方法，在这个方法里面会调用 prefixNamespace 方法去给 reducers 和 effects 加上前缀 `${namespace}${NAMESPACE_SEP}` 所以当你在组件里面 dispatch 的时候要加上前缀，具体是怎么加的可以去看 [prefixNamespace](./api/prefixNamespace.md)这篇。
::: tip 提示
如果你在 effects 内部调用 put 去触发一个 action 则不需要加前缀，因为 dva 会帮你自动加上，详情可以去看 [getSaga](./api/getSaga.md) 的 createEffects 方法。
:::
```javascript
function model(m) {
  if (process.env.NODE_ENV !== 'production') {
    checkModel(m, app._models);
  }
  const prefixedModel = prefixNamespace({ ...m });
  app._models.push(prefixedModel);
  return prefixedModel;
}
```
## 3. 在一个 model 里面可否调用其它 model 的 effects 和 reducers
通过第二个问题我们知道当在 effect put 一个 action 的时候 dva 会自动给 type 加上前缀 `${namespace}${NAMESPACE_SEP}` 但是如果加上前缀的 type 并不在当前 model 内则会使用原 type，所以我们是可以在一个 model 里面调用另一个 model 的 effects 和 reducers 的。
## 4. 为何 dispatch 方法能返回 promise
在 dva 调用 [createStore](./createStore.md) 创建 redux store 时设置了一些 middlewares，其中有一个叫 promiseMiddleware 的中间件，它的作用就是当 dispatch 一个 effects 时返回一个 promise，但是这里它做了判断只有 effects 会返回 promise，详情可以去看 [middleware](./api/middleware.md#promisemiddleware) 的解析。
