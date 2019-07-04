---
sidebarDepth: 2
---
# subscription
## 概述
subscription.js 文件是用来处理 model.subscriptions 的。
## 源码地址
`dva/packages/dva-core/src/subscription.js`
## 解析
subscription.js 文件对外暴露两个方法：run 和 unlisten，接下来我们就来分析下这两个方法。
### run
run 方法的作用是执行 subscriptions。
- subs 就是 model.subscriptions
- 对 subs 进行遍历，先判断 key 是否是 subs 的自身属性
- 如果是则依次调用每一个 subscription，参数有两个一个对象包含一个经过 prefixedDispatch 处理过的 dispatch 和 history 对象，另一个是 onError
- 上述调用的返回值赋值给常量 unlistener，如果其为 function 则存入 funcs 否则存入 nonFuncs
- 最后返回 { funcs, nonFuncs }
```javascript
export function run(subs, model, app, onError) {
  const funcs = [];
  const nonFuncs = [];
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      const unlistener = sub({
        dispatch: prefixedDispatch(app._store.dispatch, model),
        history: app._history,
      }, onError);
      if (isFunction(unlistener)) {
        funcs.push(unlistener);
      } else {
        nonFuncs.push(key);
      }
    }
  }
  return { funcs, nonFuncs };
}
```
### unlisten
我们知道如果你要使用 app.unmodel 和 app.replaceModel 方法，则 subscription 必须返回 unlisten 方法，用于取消数据订阅。
而 unlisten 方法就是用于调用 unlisten 方法的。
- unlisten 方法接受一个 unlisteners 和一个 namespace，unlisteners 是一个对象存储了所有 run 方法执行的结果按照 namespace 进行分类
- 首先判断传入的 namespace 是否在 unlisteners 上有对应的值
- 如果有值，则对其结构返回 funcs 和 nonFuncs 我们上面说过如果 subscription 执行完返回的结果是一个 function 则存入 funcs，否则存入 nonFuncs
- 接下来对 nonFuncs 做校验，如果不为空说明没有返回取消订阅的方法
- 依次调用所有 funcs 里面的方法
- 最后删除 unlisteners 里面对应的 namespace 值
```javascript
export function unlisten(unlisteners, namespace) {
  if (!unlisteners[namespace]) return;

  const { funcs, nonFuncs } = unlisteners[namespace];
  warning(
    nonFuncs.length === 0,
    `[app.unmodel] subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`,
  );
  for (const unlistener of funcs) {
    unlistener();
  }
  delete unlisteners[namespace];
}
```
