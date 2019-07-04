---
sidebarDepth: 2
---
# handleActions
## 概述
handleActions 是用来生成 reducer 的，在 [getReducer](./getReducer.md) 方法里面作为默认的 reducer 生成方法。
## 源码地址
`dva/packages/dva-core/handleActions.js`
## 解析
### handleActions
乍一看 handleAction 方法代码并不多，大概就三步：
- map 遍历 handlers(reducers) 对每个 reducer 调用 handleAction 方法，最终生成 reducers 数组
- 调用 reducerReducers 方法将多个 reducers 合并为一个 reducer
- 最后返回一个 reducer 方法
handleAction 的内部逻辑并不复杂，接下来我们来看一下 handleAction 和 reduceReducers 方法。
```javascript
function handleActions(handlers, defaultState) {
  const reducers = Object.keys(handlers).map(type =>
    handleAction(type, handlers[type])
  );
  const reducer = reduceReducers(...reducers);
  return (state = defaultState, action) => reducer(state, action);
}
```
### handleAction
可以看到 handleAction 方法作用就是生成一个 reducer，所以我们来看一下这个 reducer 内部做了什么：
- 首先对判断是否 action 对象里面有 type 参数
- 接着判断外层函数(handleAction) 的 actionType 和 type 是否一致，这里用到了闭包的知识
- 如果一致就调用外层函数传入的 reducer(state, action)
- 否则返回 state 
```javascript
function identify(value) {
  return value;
}

function handleAction(actionType, reducer = identify) {
  return (state, action) => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    if (actionType === type) {
      return reducer(state, action);
    }
    return state;
  };
}
```
### reduceReducers
reduceReducers 接收 handleActions 第一步生成的 reducers 数组，然后返回一个 reducer，这个 reducer 基本上就是最终的 reducer，这个 reducer 方法接收两个参数 previous 其实就是 state，current 其实就是 action，方法内部调用 reduce 方法对 reducers 进行遍历依次执行每个 reducer 这个 reducer 就是上面 handleAction 方法生成的那个 reducer，它的内部会判断当前 action.type 和自身的 actionType 是否一致，一致就处理，不一致就返回原数据交给下一个 reducer 处理。
```javascript
function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce((p, r) => r(p, current), previous);
}
```
