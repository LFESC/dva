---
sidebarDepth: 2
---
# prefixType
## 概述
prefixType 是一个内部方法，作用是对传入的 action type 做处理，它在 [getSaga](./getSaga.md) 方法中的 createEffects 方法内被调用。
## 源码位置
`dva/packages/dva-core/src/prefixType.js`
## 解析
- 首先获取一个加上前缀的 type：prefixedType
- 然后对 prefixedType 去除一些附加字符得到 typeWithoutAffix
- 如果 typeWithoutAffix 能匹配到 reducers 和 effects 上任意一项则返回 prefixedType
- 否则返回原 type
```javascript
import { NAMESPACE_SEP } from './constants';

export default function prefixType(type, model) {
  const prefixedType = `${model.namespace}${NAMESPACE_SEP}${type}`;
  const typeWithoutAffix = prefixedType.replace(/\/@@[^/]+?$/, '');
  if ((model.reducers && model.reducers[typeWithoutAffix])
    || (model.effects && model.effects[typeWithoutAffix])) {
    return prefixedType;
  }
  return type;
}
```
