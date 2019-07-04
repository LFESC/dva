---
sidebarDepth: 2
---
# dva-loading
## 概述
dva-loading 是 dva 的插件，可以在 store 里面自动添加 loading 状态，具体使用方法可以看[这里](https://github.com/dvajs/dva/tree/master/packages/dva-loading)
## 版本
**2.0.6**
## 源码地址
`dva/packages/dva-loading/src/index.js`
## 解析
dva-loading 给外部暴露的就是 createLoading 这个方法，接下来我们就来看看这个方法做了什么。
- 定义 namespace: namespace 是用户可以自定义的参数，如果未定义则为 'loading'
- 对 only 和 except 做校验: 这两个参数也是外部传入的，只不过没有在文档上找到它们的用法
- 定义 initialState: loading store 的初始状态，它包含三个属性：global modals 和 effects
- 返回 hooks: 返回了 extraReducers 和 onEffect 这两个 hooks
那么接下来我们就来看下 extraReducers 和 onEffect 这两个 hooks。
```javascript
const SHOW = '@@DVA_LOADING/SHOW';
const HIDE = '@@DVA_LOADING/HIDE';
const NAMESPACE = 'loading';

function createLoading(opts = {}) {
  const namespace = opts.namespace || NAMESPACE;
  
  const { only = [], except = [] } = opts;
  if (only.length > 0 && except.length > 0) {
    throw Error('It is ambiguous to configurate `only` and `except` items at the same time.');
  }

  const initialState = {
    global: false,
    models: {},
    effects: {},
  };

  const extraReducers = {
    // ......
  };

  function onEffect(effect, { put }, model, actionType) {
    // ......
  }

  return {
    extraReducers,
    onEffect,
  };
}
```
### onEffect
onEffect 方法定义了如何处理 saga 的 effect
- 首先对 only 和 except 进行判断，在这里我们发现了 only 和 except 的作用，only 表示只对哪些 action 处理，except 表示哪些 action 不处理，所以这里需要对它们做一个判断
  1. 如果 only 和 except 都为空则表示对所有 action 都处理
  2. 如果 only 数组里面包含 action 则处理
  3. 如果 except 数组里面不包含 action 则处理
  4. 如果以上情况都不成立则不处理直接返回 effect
- 如果上面的判断成立则对外部传入的 effect 方法做些额外的处理：
  1. 在调用 effect 方法之前先调用 saga put 派发一个 SHOW action
  2. 调用 effect 方法
  3. 在调用 effect 方法完成后调用 saga put 派发一个 HIDE action
接下来我们来看一下 extraReducers 
::: tip 提示
关于 onEffect 的内部实现可以去看 dva 源码解析中的 [getSaga](../dva/api/getSaga.md)。
:::
```javascript
function onEffect(effect, { put }, model, actionType) {
  const { namespace } = model;
  if (
      (only.length === 0 && except.length === 0)
      || (only.length > 0 && only.indexOf(actionType) !== -1)
      || (except.length > 0 && except.indexOf(actionType) === -1)
  ) {
      return function*(...args) {
          yield put({ type: SHOW, payload: { namespace, actionType } });
          yield effect(...args);
          yield put({ type: HIDE, payload: { namespace, actionType } });
      };
  } else {
      return effect;
  }
}
```
### extraReducers
在这个 reducer 里面处理了两个 action，这两个 action 就是上面触发的 SHOW 和 HIDE
- SHOW: 对于 SHOW action，reducer 会将 global 置为 true，models 里面对应的 namespace 置为 true；effects 里面对应的 actionType 置为 true
- HIDE: 对于 HIDE action，reducer 会首先将 effects 里面对应的 actionType 置为 true，然后对所有 effects 做 some 遍历对比当前的 namespace 和 每一个 effect 的 namespace 如果相等就返回 effects\[actionType\] 否则返回 false 最终的结果就是 models 里面对应的 namespace的结果；最后对 models keys 做 some 遍历条件是返回 models\[namespace\] 最终结果就是 globals 的值  
这里最后总结一下：
- SHOW: 这个逻辑比较简单就是只要调用了 effect 就全部设置为 true
- HIDE: 首先 effects 对象里面对应的 effect 肯定设为 false，对于 models 只要任何 effects 里面能和当前 namespace 匹配上并且只要有一个为 true 就为 true 否则为 false；对于 globals 只要 models 里面有一项为 true 就为 true 否则为 false 
::: tip 提示
关于 extraReducers 的内部实现可以去看 dva 源码解析中的 [core.create()](../dva/api/core-create.md#其它) 方法。
:::
```javascript
const extraReducers = {
  [namespace](state = initialState, { type, payload }) {
    const { namespace, actionType } = payload || {};
    let ret;
    switch (type) {
      case SHOW:
        ret = {
          ...state,
          global: true,
          models: { ...state.models, [namespace]: true },
          effects: { ...state.effects, [actionType]: true },
        };
        break;
      case HIDE: // eslint-disable-line
        const effects = { ...state.effects, [actionType]: false };
        const models = {
          ...state.models,
          [namespace]: Object.keys(effects).some((actionType) => {
            const _namespace = actionType.split('/')[0];
            if (_namespace !== namespace) return false;
            return effects[actionType];
          }),
        };
        const global = Object.keys(models).some((namespace) => {
          return models[namespace];
        });
        ret = {
          ...state,
          global,
          models,
          effects,
        };
        break;
      default:
        ret = state;
        break;
    }
    return ret;
  },
};
```
