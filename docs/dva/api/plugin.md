---
sidebarDepth: 2
---
# plugin
## 概述
plugin 是 redux-saga 内部处理 hooks 的，主要在 [core.create()](./core-create.md) 方法里面使用。 
## 源码位置
`dva/packages/dva-core/src/Plugin.js`
## 解析
### Plugin
Plugin.js 文件默认导出一个 Plugin 类
- 在 constructor 里面定义了 _handleActions 和 hooks 属性，hooks 是一个对象，key 是所有的 hooks 值为一个数组
- 接下来实现了三个方法 use apply 和 get，我们将在下面讲解
```javascript
const hooks = [
  'onError',
  'onStateChange',
  'onAction',
  'onHmr',
  'onReducer',
  'onEffect',
  'extraReducers',
  'extraEnhancers',
  '_handleActions',
];

export default class Plugin {
  constructor() {
    this._handleActions = null;
    this.hooks = hooks.reduce((memo, key) => {
      memo[key] = [];
      return memo;
    }, {});
  }

  use(plugin) {
    // ......
  }

  apply(key, defaultHandler) {
    // ......
  }

  get(key) {
    // ......
  }
}
```
### use
use 方法是 [app.use(hooks)](https://dvajs.com/api/#app-use-hooks) 的内部实现，如果你看了 [core.create()](./core-create.md) 这篇你就会知道，它的作用是配置 hooks，接下来我们就来看一下它的内部实现。
- 首先通过 isPlainObject 判断 plugin 是否是一个纯对象（通过 Object constructor 创建的）
- 遍历 plugin 对象，如果 key 是 plugin 自身的属性就对 key 值分别进行判断
- `key === '_handleActions'`: 给 this._handleActions 赋值
- `key === 'extraEnhancers'`: 将新的 extraEnhancers 覆盖掉原有的 
- 其它情况将 plugin push 到对应的数组里
```javascript
use(plugin) {
  invariant(
    isPlainObject(plugin),
    'plugin.use: plugin should be plain object'
  );
  const hooks = this.hooks;
  for (const key in plugin) {
    if (Object.prototype.hasOwnProperty.call(plugin, key)) {
      invariant(hooks[key], `plugin.use: unknown plugin property: ${key}`);
      if (key === '_handleActions') {
        this._handleActions = plugin[key];
      } else if (key === 'extraEnhancers') {
        hooks[key] = plugin[key];
      } else {
        hooks[key].push(plugin[key]);
      }
    }
  }
}
```
### apply
apply 会返回一个函数，这个函数会执行所有 onError 或 onHmr 的处理函数，这个方法只在内部使用。
- 首先校验 key 是否属于 onError 和 onHmr
- 获取对应的 hooks 数组 fns
- 返回一个匿名方法，里面判断 fns 如果不为空的话就依次调用其中的方法，如果不为空的调用 apply 传递进来的 defaultHandler
```javascript
apply(key, defaultHandler) {
  const hooks = this.hooks;
  const validApplyHooks = ['onError', 'onHmr'];
  invariant(
    validApplyHooks.indexOf(key) > -1,
    `plugin.apply: hook ${key} cannot be applied`
  );
  const fns = hooks[key];

  return (...args) => {
    if (fns.length) {
      for (const fn of fns) {
        fn(...args);
      }
    } else if (defaultHandler) {
      defaultHandler(...args);
    }
  };
}
```
### get
get 用于根据传入的 key 获取对应的 hooks，主要在 [core.create()] 方法里面调用。
- 首先校验 key 是否属于 hooks 里面的属性，然后对 key 分别做判断
- `key === 'extraReducers'`: 调用 getExtraReducers 下面会介绍
- `key === 'onReducer'`: 调用 getOnReducer 下面会介绍
- 其它情况直接返回对应的 hooks
```javascript
get(key) {
  const hooks = this.hooks;
  invariant(key in hooks, `plugin.get: hook ${key} cannot be got`);
  if (key === 'extraReducers') {
    return getExtraReducers(hooks[key]);
  } else if (key === 'onReducer') {
    return getOnReducer(hooks[key]);
  } else {
    return hooks[key];
  }
}
```
#### getExtraReducers
getExtraReducers 将 hooks['extraReducers'] 里面保存的对象数组延展成一个一维对象并返回。
```javascript
function getExtraReducers(hook) {
  let ret = {};
  for (const reducerObj of hook) {
    ret = { ...ret, ...reducerObj };
  }
  return ret;
}
```
#### getOnReducer
返回一个方法，这个方法将所有 hook 里面的 reducerEnhancer 链式调用，最终返回的方法接受一个 reducer，返回链式调用的那个方法。
举个例子：
```javascript
const hook = [rn1, rn2, rn3];

getOnReducer(hook)

// 返回的结果是：(reducer) => rn3(rn2(rn1(reducer)))
```
```javascript
function getOnReducer(hook) {
  return function(reducer) {
    for (const reducerEnhancer of hook) {
      reducer = reducerEnhancer(reducer);
    }
    return reducer;
  };
}
```
### filterHooks
plugin.js 文件还对外暴露了一个 filterHooks 方法，见名知意它的作用就是对传入的 hooks 进行筛选，只有在 dva 规定的 hooks 列表中才会将其返回。
```javascript
export function filterHooks(obj) {
  return Object.keys(obj).reduce((memo, key) => {
    if (hooks.indexOf(key) > -1) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
}
```
