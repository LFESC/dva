---
sidebarDepth: 2
---
# getReducer
## 概述
getReducer 用于根据 model.reducers 生成 redux reducer，它在 `dva-core/src/index.js` 中的 start 和 injectModel 方法被调用，详情可以看[这里](./core-create.md)。
## 源码地址
`dva/packages/dva-core/src/getReducer.js`
## 解析
可以看到 getReducer 方法会处理两种情况：
- reducers 为数组：reducers 为数组时可以支持 enhancer，格式就像注释里写的一样：[realReducers, enhancer]
- reducers 为对象：这种就是我们常用的格式
无论是 array 还是 object，最终生成 reducer 都是通过 `(handleActions || defaultHandleActions)(reducers, state)`
handleActions 参数如果没有就用 dva 内部提供的 defaultHandleActions 然后传入 reducers 和 初始状态。
::: tip 提示
defaultHandleActions 的相关解析可以看[这里](./defaultHandleActions.md)
:::
```javascript
import defaultHandleActions from './handleActions';

export default function getReducer(reducers, state, handleActions) {
  // Support reducer enhancer
  // e.g. reducers: [realReducers, enhancer]
  if (Array.isArray(reducers)) {
    return reducers[1](
      (handleActions || defaultHandleActions)(reducers[0], state)
    );
  } else {
    return (handleActions || defaultHandleActions)(reducers || {}, state);
  }
}
```
