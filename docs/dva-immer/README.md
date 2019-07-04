---
sidebarDepth: 2
---
# dva-immer
## 概述
利用 immer 简化 reducer 生成 immutable state。
## 版本
**0.2.4**
## 源码地址
`dva/packages/dva-immer/src/index.js`
## 解析
我们知道 dva-immer 的使用方法如下：
```javascript
const app = dva();

app.use(require('dva-immer').default());
```
所以其实它是通过 [`app.use`](../dva/api/core-create.md#use) 去实现的，app.use 接收一个 hooks 对象，我们看到下方就是 dva-immer 默认导出的一个方法，它返回的就是一个 hooks 对象，只不过它定义的这个 _handleActions 我们没在官方文档里面见过，但是你确实是可以用的，它的作用是替代 [handleActions](../dva/handleActions.md) 这个默认的方法来根据 model.reducers 生成 reducer，但是 dva 给它加了一个下划线，目的应该是不想让用户轻易去定义它的行为，除非特殊情况或是插件。
::: tip 提示
_handleActions 的调用可以去看 [core-create](../dva/core-create.md) 中的 start 和 injectModel 方法。
:::
说了这么多前期铺垫，接下来我们该看具体实现了，其实也就是这个 _handleActions，我建议看之前还是先了解一下 [getReducer](../dva/getReducer.md) 它是 _handleActions 方法被使用的地方。
- 首先了解一下接收的参数：handlers 是 model.reducers，defaultState 是默认的 state
- 返回一个 reducer
- 在这个 reducer 内部执行了 immer 的 produce 方法
- 在 produce 方法内部根据 action.type 获取到了对应的 handler
- 如果 handler 存在就调用它 `handler(draft, action)` 将得到函数返回值 compatiableRet
- 如果使用了 dva-immer 其实是可以不用 return 任何值的，但是如果你还是使用传统的 reducer 那套模式 immer 也是可以兼容的，只不过就相当于没有用上 immer 的特性
- 最后还对 produce 的结果做了判断如果是 undefined 则返回空对象
```javascript
import produce from 'immer';

export default function () {
  return {
    _handleActions(handlers, defaultState) {
      return (state = defaultState, action) => {
        const { type } = action;

        const ret = produce(state, draft => {
          const handler = handlers[type];
          if (handler) {
            const compatiableRet = handler(draft, action);
            if (compatiableRet !== undefined) {
              // which means you are use redux pattern
              // it's compatiable. https://github.com/mweststrate/immer#returning-data-from-producers
              return compatiableRet;
            }
          }
        });
        return ret === undefined ? {} : ret;
      };
    },
  };
}
```
