---
sidebarDepth: 2
---
# prefixNamespace
## 概述
prefixNamespace 方法的作用是给传入的 model 的 effects 和 reducers 添加前缀：`${namespace}${NAMESPACE_SEP}`，它在 [core.create()](./core-create.md#解析) 方法里面调用。
## 源码地址
`dva/packages/dva-core/src/prefixNamespace.js`
## 解析
### prefixNamespace
我们看到 prefixNamespace 方法接收 model 对象并对齐进行结构，然后分别对 reducers 和 effects 进行处理。
- reducers: reducers 有两种数据类型：数组和对象，所以要先判断是哪种数据类型，然后将获取到的 reducers 对象、namespace、'reducer' 三个参数传递给 prefix 方法，将结果重新赋值给 model.reducers 
- effects: 直接调用 prefix 方法
- 最终将 model 返回
```js
export default function prefixNamespace(model) {
  const {
    namespace,
    reducers,
    effects,
  } = model;

  if (reducers) {
    if (isArray(reducers)) {
      model.reducers[0] = prefix(reducers[0], namespace, 'reducer');
    } else {
      model.reducers = prefix(reducers, namespace, 'reducer');
    }
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  return model;
}
```
### prefix
prefix 方法对传入的 obj 取其 keys 进行 reduce 操作，在遍历函数中做了如下操作：
- 判断 key 是否已经添加了前缀，如果添加了则报错
- 如果没添加就给 memo(新创建的空对象) 添加带前缀的属性和值
- 最后返回 memo
```js
function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    warning(
      key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`,
    );
    const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}
```
