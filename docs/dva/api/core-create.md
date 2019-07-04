---
sidebarDepth: 2
---
# core.create()
## 概述
core.create() 方法是 [dva()](./dva.md) 方法创建 app 对象的内部实现。
## 源码地址
`dva/packages/dva-core/src/index.js`
## 解析
### create
经过精简我们发现 create 方法内部其实就是创建了一个 app 对象然后返回了它。
首先我们了解一些 app 对象的私有属性：
- _models: 存放所有 models，默认值为 dvaModel
- _store: redux 的 store，在 start 方法里面创建
- _plugin: [plugin](./plugin.md) 对象
接着我们看一下 app 里面的方法，这些方法包含了 use model start unmodel replace，除了 start 其余都是暴露给外面的 api，接下来就去看一看这几个方法是如何实现的。
::: tip 提示
- app.router 是在 [dva](./dva.md) 里面实现的
- app.start 也是在 [dva](./dva.md) 里面实现的，这里的 start 方法不是对外暴露的那个 start 方法
- filterHooks 方法是对传入的 hooks 做了筛选，具体实现看[这里](./plugin.md#filterhooks)
- plugin.use 涉及到 plugin 的逻辑，可以看[这里](./plugin.md#use)
:::
```javascript
export function create(hooksAndOpts = {}, createOpts = {}) {
  const { initialReducer, setupApp = noop } = createOpts;

  const plugin = new Plugin();
  plugin.use(filterHooks(hooksAndOpts));

  const app = {
    _models: [prefixNamespace({ ...dvaModel })],
    _store: null,
    _plugin: plugin,
    use: plugin.use.bind(plugin),
    model,
    start,
  };
  return app;

  function model(m) {
    // ......
  }
  
  function start() {
    // ......
  }
}
```
### use
use 方法其实是 Plugin 对象的 use 方法，所以我们将在 [plugin](./plugin.md#use) 那篇里面进行细致的讲解。
```javascript
const plugin = new Plugin();

const app = {
  // ......
  use: plugin.use.bind(plugin),
  // ......
};
```
### model
model 方法也很简单：
- 首先调用 [prefixNamespace](./prefixNamespace.md) 去处理传入的 model(m) 对象
- 将处理好的 model 存入 _models 数组中
- 返回处理好的 model 对象
```javascript
function model(m) {
  if (process.env.NODE_ENV !== 'production') {
    // ......
  }
  const prefixedModel = prefixNamespace({ ...m });
  app._models.push(prefixedModel);
  return prefixedModel;
}
```
但是还没完，这个 model 方法会在 start 方法里面被修改，真正实现的是 injectModel 这个方法，这个方法乍看起来不复杂，实际却调用了很多其它模块的方法，所以我们在本篇里面只需明白此方法的骨架即可。
- 首先调用上述的 model 方法获取 m 对象
- 通过 getReducer 方法生成一个 reducer
- 调用 store.replaceReducer 的方法重新生成全局 reducer，这也很好理解，因为 app.model 会注册新的 reducer，所以必然要生成新的全局 reducer
- 如果传入的 model 上面有 effects 则调用 store.runSaga 方法（即 redux-saga 的 middleware.run），这里面值得一说的是 app._getSaga 方法，因为内容较多，故专门放在 [getSaga](./getSaga.md) 这章讲解
- 如果有 subscriptions 则调用 [runSubscription](./subscription.md#run) 去处理，同时返回的值赋给 unlisteners，这个对象用于解除接听
::: tip 提示
- 关于 getReducer 的解析可以看[这里](./getReducer.md)   
- createReducer 方法会在最后介绍
- _handleActions 是 dva 的 hooks 之一，但是在文档里面没有说，一般也不会用到，它的作用是替代默认的 [handleActions](./handleActions.md) 来自定义如何生成 reducer，目前我知道的应用场景只有 [dva-immer](../../dva-immer/README.md)
值得
:::
```javascript
// Setup app.model and app.unmodel
app.model = injectModel.bind(app, createReducer, onError, unlisteners);
```
```javascript
function injectModel(createReducer, onError, unlisteners, m) {
  m = model(m);

  const store = app._store;
  store.asyncReducers[m.namespace] = getReducer(
    m.reducers,
    m.state,
    plugin._handleActions
  );
  store.replaceReducer(createReducer());
  if (m.effects) {
    store.runSaga(
      app._getSaga(m.effects, m, onError, plugin.get('onEffect'))
    );
  }
  if (m.subscriptions) {
    unlisteners[m.namespace] = runSubscription(
      m.subscriptions,
      m,
      app,
      onError
    );
  }
}
```
### unmodel
通过分析源码我们可以看出 unmodel 主要做了如下几件事：
- 删除 store.asyncReducers 和 reducers 对应的 reducer
- 调用 replaceReducer 替换为新的全局 reducer
- dispatch `@@dva/UPDATE` action，这个 action 内部并未处理
- dispatch `${namespace}/@@CANCEL_EFFECTS` action，这个在[getSaga](./getSaga.md) 里面做了处理
- 调用 [unlistenSubscription](./subscription.md#unlisten) 解除监听器
- 从 app._models 里面删除对应的 model
::: tip 提示
asyncReducers 和 reducers 的区别：asyncReducers 是通过 app.model 动态加载的 而 reducers 是初始的
:::
```javascript
function unmodel(createReducer, reducers, unlisteners, namespace) {
  const store = app._store;

  // Delete reducers
  delete store.asyncReducers[namespace];
  delete reducers[namespace];
  store.replaceReducer(createReducer());
  store.dispatch({ type: '@@dva/UPDATE' });

  // Cancel effects
  store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

  // Unlisten subscrioptions
  unlistenSubscription(unlisteners, namespace);

  // Delete model from app._models
  app._models = app._models.filter(model => model.namespace !== namespace);
}
```
### replaceModel
replaceModel 主要分为下面几步：
- 根据 model 的 namespace 找到在 models 数组里的 index 也就是 oldModelIdx
- 判断 oldModelIdx 是否存在，如果存在则：
  - dispatch `${namespace}/@@CANCEL_EFFECTS` 这个 action 会在 [getSaga](./getSaga.md) 里面处理
  - 删除 asyncReducers 和 reducers 上的 reducer
  - 调用 [unlistenSubscription](./subscription.md#unlisten) 解除对 subscrioptions 的监听
  - 调用 splice 从 models 里面删除原 model
- 通过 app.model(m) 注册新的 model
- dispatch `@@dva/UPDATE`
::: tip 提示
关于 `~oldModelIdx` 这里用了按位非，如果 oldModelIdx = -1，按位非后值为 0 因此可以用来判断。
:::
```javascript
function replaceModel(createReducer, reducers, unlisteners, onError, m) {
  const store = app._store;
  const { namespace } = m;
  const oldModelIdx = findIndex(
    app._models,
    model => model.namespace === namespace
  );

  if (~oldModelIdx) {
    // Cancel effects
    store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

    // Delete reducers
    delete store.asyncReducers[namespace];
    delete reducers[namespace];

    // Unlisten subscrioptions
    unlistenSubscription(unlisteners, namespace);

    // Delete model from app._models
    app._models.splice(oldModelIdx, 1);
  }

  // add new version model to store
  app.model(m);

  store.dispatch({ type: '@@dva/UPDATE' });
}
```
### start
start 方法比较庞大，我将其分为几大部分（有些是作者自己分的），下面每一条对应的就是下方代码中注释的第几条。
1. **生成 reducers 和 sagas：** 遍历 app._models 生成 reducers 以及根据每个 model 的 effects 生成 sagas
2. **生成 reducerEnhancer 并校验 extraReducers：** reducerEnhancer 用于最下方的 createReducer 方法，获取 extraReducers 并对其遍历判断是否有和 reducers 冲突的 reducer
3. **创建 store：** 调用 [createStore](./createStore.md) 方法生成 store
4.  **扩展 store：** store 对象上面添加 runSaga 和 asyncReducers
5. **执行 listener 当 state 改变时：** 调用 store.subscribe 设置 store 改变时的监听器，处理函数就是 onStateChange 定义的 listeners
6. **run sagas：** 遍历 sagas 执行 sagaMiddleware.run 执行 saga
7. **设置 app：** 调用 setupApp 方法，这个方法是外部传入的，关于这个方法做了什么可以去看[dva()](./dva.md) 
8. **执行 subscriptions：** 遍历所有的 models 并通过 [runSubscription](./subscription.md#run) 执行每个 models 的 subscriptions
9. **设置 model unmodel 和 replaceModel：** 给 app 添加这几个方法，这几个方法的内部实现我们都在上面详细讲述了
::: tip 提示
_handleActions 是 dva 的 hooks 之一，但是在文档里面没有说，一般也不会用到，它的作用是替代默认的 [handleActions](./handleActions.md) 来自定义如何生成 reducer，目前我知道的应用场景只有 [dva-immer](../../dva-immer/README.md)
:::
```javascript
function start() {
  // 全局错误处理
  const onError = (err, extension) => {
    // ......
  };

  const sagaMiddleware = createSagaMiddleware();
  const promiseMiddleware = createPromiseMiddleware(app);
  app._getSaga = getSaga.bind(null);

  // ------ 1. 生成 reducers 和 sagas -------
  const sagas = [];
  const reducers = { ...initialReducer };
  for (const m of app._models) {
    reducers[m.namespace] = getReducer(
      m.reducers,
      m.state,
      plugin._handleActions
    );
    if (m.effects)
      sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));
  }

  // ------ 2. 生成 reducerEnhancer 并校验 extraReducers -------
  const reducerEnhancer = plugin.get('onReducer');
  const extraReducers = plugin.get('extraReducers');
  invariant(
    Object.keys(extraReducers).every(key => !(key in reducers)),
    `[app.start] extraReducers is conflict with other reducers, reducers list: ${Object.keys(
      reducers
    ).join(', ')}`
  );

  // ------- 3. 创建 store --------
  const store = (app._store = createStore({
    // eslint-disable-line
    reducers: createReducer(),
    initialState: hooksAndOpts.initialState || {},
    plugin,
    createOpts,
    sagaMiddleware,
    promiseMiddleware,
  }));

  // ------- 4. 扩展 store --------
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {};

  // ------- 5. 执行 listener 当 state 改变时 --------
  const listeners = plugin.get('onStateChange');
  for (const listener of listeners) {
    store.subscribe(() => {
      listener(store.getState());
    });
  }

  // -------- 6. run sagas --------
  sagas.forEach(sagaMiddleware.run);

  // -------- 7. 设置 app --------
  setupApp(app);

  // -------- 8. 执行 subscriptions --------
  const unlisteners = {};
  for (const model of this._models) {
    if (model.subscriptions) {
      unlisteners[model.namespace] = runSubscription(
        model.subscriptions,
        model,
        app,
        onError
      );
    }
  }

  // -------- 9. 设置 model unmodel 和 replaceModel --------
  app.model = injectModel.bind(app, createReducer, onError, unlisteners);
  app.unmodel = unmodel.bind(app, createReducer, reducers, unlisteners);
  app.replaceModel = replaceModel.bind(
    app,
    createReducer,
    reducers,
    unlisteners,
    onError
  );

  /**
   * 给 redux 创建全局的 reducers
   *
   * @returns {Object}
   */
  function createReducer() {
    return reducerEnhancer(
      combineReducers({
        ...reducers,
        ...extraReducers,
        ...(app._store ? app._store.asyncReducers : {}),
      })
    );
  }
}
```
### 其它
**1. createReducer**  
createReducer 的作用很简单就是将所有 reducers 结合成一个 reducer，实现也很简单，但是这里特别拿出来讲是因为在这个方法里面它调用了 onReducer 和 extraReducers 这两个 hooks。
```javascript
const reducerEnhancer = plugin.get('onReducer');

function createReducer() {
  return reducerEnhancer(
    combineReducers({
      ...reducers,
      ...extraReducers,
      ...(app._store ? app._store.asyncReducers : {}),
    })
  );
}
```
