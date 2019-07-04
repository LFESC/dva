---
sidebarDepth: 2
---
# getSaga
## 概述
getSaga 是 dva 内部方法，主要作用是根据 model.effects 生成对应的 saga 函数，在 model ummodel replaceModel 等 api 里面都有调用，具体可以去看[core.create](./core-create.md)。
## 源码地址
`dva/packages/dva-core/src/getSaga.js`
## 解析
### getSaga
可以看到 getSaga 函数的返回值是一个 Generator 方法，在这个方法里面对传入的 effects 对象进行遍历，然后判断 key 是否是 effects 的自身属性，如果不是则什么都不做，如果是会做如下几件事：
- 调用 getWatcher 生成 watcher，这个 getWatcher 方法会在下面讲
- 调用 fork 传入 watcher
- 调用 fork 传入一个匿名 Generator 方法，这个方法 take 了一个 `${model.namespace}/@@CANCEL_EFFECTS` action，当这个 action 触发的时候说明调用了 unmodel 或 replaceModel 卸载了 model，此时就会触发这个 action 接着调用 cancel 取消这个 saga
::: tip 提示
这块涉及到了一些 redux-saga 相关的知识点，如果对 redux-saga 的源码感兴趣可以看我的[这篇文章](https://www.jianshu.com/p/1a90c676f23d)。
:::
```javascript
export default function getSaga(effects, model, onError, onEffect) {
  return function*() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(key, effects[key], model, onError, onEffect);
        const task = yield sagaEffects.fork(watcher);
        yield sagaEffects.fork(function*() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}
```
### getWatcher
getWatcher 方法的目的是根据 effects 生成 watcher generator，effects 中每一项的 key 就是监听的 action。
因为 getWatcher 方法比较大，所以我将其分成了四部分进行讲解。
```javascript
function getWatcher(key, _effect, model, onError, onEffect) {
  let effect = _effect;
  let type = 'takeEvery';
  let ms;

  // --------- 1. 校验参数 ----------
  if (Array.isArray(_effect)) {
    // ......
  }

  function noop() {}

  // --------- 3. sagaWithCatch --------
  function* sagaWithCatch(...args) {
    // ......
  }

  // --------- 4. sagaWithOnEffect ------------
  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

  // --------- 2. switch ----------
  switch (type) {
    // ......
  }
}
```
**1. 校验参数**  
首先是对参数进行校验，这个比较简单，effects 的 item 可以是一个方法或是一个数组，所以首先判断 effect 类型，其次如果是数组类型，数组里面第二项的值表示 watcher 的类型一共有四种：watcher takeEvery takeLatest throttle，如果是 throttle 则必须要有参数 ms；最后判断 type 是否属于上述四种类型之一。
```javascript
if (Array.isArray(_effect)) {
  effect = _effect[0];
  const opts = _effect[1];
  if (opts && opts.type) {
    type = opts.type;
    if (type === 'throttle') {
      invariant(
        opts.ms,
        'app.start: opts.ms should be defined if type is throttle'
      );
      ms = opts.ms;
    }
  }
  invariant(
    ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
    'app.start: effect type should be takeEvery, takeLatest, throttle or watcher'
  );
}
```
**2. switch** 
虽然 switch 是放在最后面执行的，但是内部调用了第三步和第四步定义的方法，所以为了方便后续理解，先讲述 switch 方法，switch 方法对你传入的 type 进行判断：
- watcher: 返回 sagaWithCatch 方法，下面我们会讲到
- takeLatest: 返回一个 Generator 方法里面执行 takeLatest，参数是 key（effect 的 key）和 sagaWithOnEffect，sagaWithOnEffect 方法我们下面会讲到
- throttle: 同 takeLatest 只不过多了 ms 参数
- default: 对于没有 type 或是以对象形式定义的 effect 默认用 takeEvery 处理
```javascript
switch (type) {
  case 'watcher':
    return sagaWithCatch;
  case 'takeLatest':
    return function*() {
      yield takeLatest(key, sagaWithOnEffect);
    };
  case 'throttle':
    return function*() {
      yield throttle(ms, key, sagaWithOnEffect);
    };
  default:
    return function*() {
      yield takeEvery(key, sagaWithOnEffect);
    };
}
```
**3. sagaWithCatch**  
sagaWithCatch 的作用是处理 watcher，老实说我并没有在官方文档上找到 watcher 类型的作用是什么，我们只好通过代码来理解了。
- 在调用 effect 方法之前会先 put 一个 start action
- 接着调用 effect 方法，参数这里调用了 createEffects 这个我们会在下面讲述
- effect 执行完毕之后会 put 一个 end action
- 如果有错误则调用 onError 全局错误处理方法  
::: tip 提示
__dva_resolve 和 __dva_reject 和 [promiseMiddleware](./middlewares.md#promisemiddleware) 有关，主要作用是当 dispatch 一个 effect 时返回一个 promise。
:::
```javascript
function* sagaWithCatch(...args) {
  const { __dva_resolve: resolve = noop, __dva_reject: reject = noop } =
    args.length > 0 ? args[0] : {};
  try {
    yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` });
    const ret = yield effect(...args.concat(createEffects(model)));
    yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` });
    resolve(ret);
  } catch (e) {
    onError(e, {
      key,
      effectArgs: args,
    });
    if (!e._dontReject) {
      reject(e);
    }
  }
}
```
**4. sagaWithOnEffect**
sagaWithOnEffect 是 takeLatest throttle takeEvery 的 saga 参数，我们发现它是 applyOnEffect 的返回值，我们接下来去看看这个方法。
applyOnEffect 方法是处理 [onEffect](https://dvajs.com/api/#app-use-hooks) 这个 hook 的，如果 onEffect 数组里面有值则会一次调用钩子函数，否则返回 effect 也就是 sagaWithCatch，所以本质上无论是 watcher 类型还是其它类型最终都是调用的 sagaWithCatch。
::: tip 提示
onEffect 的值是 `plugin.get('onEffect')` 如果想了解 plugin 请看[这篇文章](./plugin.md)
:::
```javascript
const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

function applyOnEffect(fns, effect, model, key) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
```
**5. createEffects**  
createEffects 是 sagaWithCatch 方法内部调用 effect 方法时生成参数的函数，所以它的作用就是将 redux-saga 的 effect creators 传入 effect 方法中，这样你才能这样使用：  
下方 { put call } 就是通过 createEffects 生成的
```javascript
effects: {
  *addRemote({ payload: todo }, { put, call }) {
    yield call(addTodo, todo);
    yield put({ type: 'add', payload: todo });
  },
},
```
- assertAction: 首先定义了一个 assertAction 方法，这个方法用于对 type 做一些校验
- put: put 方法是对于 redux-saga 的 put 方法做了一层封装，它首先调用 assertAction 对 type 做校验，接着才调用 saga 的 put 方法，注意它会对 type 用 [prefixType](./prefixType.md) 方法做一个处理，这个方法比较简单，所以代码我就不贴了，简单说一下就是如果 put 的 action type 在 model 的 effects 或是 reducers 里面就加一个前缀：`${model.namespace}${NAMESPACE_SEP}${type}` 否则就返回原有的 type
- putResolve: putResolve 是对 saga 的 put.resolve 做了一层封装，做的事情和 put 一样，所以就不赘述了，然后 `put.resolve = putResolve;` 用 putResolve 覆盖原方法
- take: take 方法是对 saga 的 take 方法做了一层封装，作用和上面一样
- 最后将新的 put take 和其它 effects 一起返回
::: tip 提示
- 为何只对 take 和 put 方法做处理，我认为是因为它俩的参数有 action，而 dva 需要对 action.type 做添加前缀的处理，所以才会对这两个方法进行封装
- sagaEffects 是所有 redux-saga 导出的 effects creator，这个通过 import 整体加载实现的，详情可以看源码
```javascript
function createEffects(model) {
  function assertAction(type, name) {
    invariant(type, 'dispatch: action should be a plain Object with type');
    warning(
      type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
      `[${name}] ${type} should not be prefixed with namespace ${
        model.namespace
      }`
    );
  }
  function put(action) {
    const { type } = action;
    assertAction(type, 'sagaEffects.put');
    return sagaEffects.put({ ...action, type: prefixType(type, model) });
  }

  function putResolve(action) {
    const { type } = action;
    assertAction(type, 'sagaEffects.put.resolve');
    return sagaEffects.put.resolve({
      ...action,
      type: prefixType(type, model),
    });
  }
  put.resolve = putResolve;

  function take(type) {
    if (typeof type === 'string') {
      assertAction(type, 'sagaEffects.take');
      return sagaEffects.take(prefixType(type, model));
    } else if (Array.isArray(type)) {
      return sagaEffects.take(
        type.map(t => {
          if (typeof t === 'string') {
            assertAction(t, 'sagaEffects.take');
            return prefixType(t, model);
          }
          return t;
        })
      );
    } else {
      return sagaEffects.take(type);
    }
  }
  return { ...sagaEffects, put, take };
}
```
