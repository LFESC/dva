---
sidebarDepth: 1
---
# 输出文件
## dva/router
### 源码地址
`dva/packages/dva/router.js`
### 解析
当你 `import { Router, Route, routerRedux } from 'dva/router';` 就是 import `react-router-dom` 和 `react-router-redux` 这两个库里面的 api。
```javascript
module.exports = require('react-router-dom');
module.exports.routerRedux = require('react-router-redux');
```
## dva/fetch
### 源码地址
`dva/packages/dva/fetch.js`
### 解析
当你 `import 'dva/fetch';` 就是 import `isomorphic-fetch` 这库里面的 api。
```javascript
module.exports = require('isomorphic-fetch');
```
## dva/saga
### 源码地址
`dva/packages/dva/saga.js`
### 解析
当你 `import { ... } from 'dva/saga` 就是 import `redux-saga` 这个库里所有的 api。
```javascript
module.exports = require('dva-core/saga');
```
```javascript
module.exports = require('redux-saga/lib');
```
## dva/dynamic
dva/dynamic 会返回一个 dynamic 方法，该方法接受一个 config 返回一个可以动态加载的组件，关于该 api 的详细用法可以看[这里](https://dvajs.com/api/#dva-dynamic)。
### 源码地址
`dva/packages/dva/dynamic`
### 解析
该方法指向的是 dynamic.js 文件中的 dynamic 方法，可以看到该方法最终调用了 asyncComponent 方法，并传递进去 resolve 和其它用户传入的 config 参数，在看 asyncComponent 方法之前，我们需要先了解 resolve 方法的作用。
**1. resolve**  
- 我们可以看到 resolve 方法最终返回了一个 promise 对象，在 promise 的方法体内调用了 Promise.all 方法去执行 models 和 component 这两个 import() 异步加载，返回的结果存在 ret 里
- 如果 models 没有传递那就直接 resolve component
- 如果 models 有值就依次调用 registerModel 方法注册 models，这个方法比较简单，其内部就是利用了 app.model 这个 api，注册完毕之后再 resolve component
```javascript
module.exports = require('./lib/dynamic');
```
```javascript
export default function dynamic(config) {
  const { app, models: resolveModels, component: resolveComponent } = config;
  return asyncComponent({
    resolve: config.resolve || function () {
      const models = typeof resolveModels === 'function' ? resolveModels() : [];
      const component = resolveComponent();
      return new Promise((resolve) => {
        Promise.all([...models, component]).then((ret) => {
          if (!models || !models.length) {
            return resolve(ret[0]);
          } else {
            const len = models.length;
            ret.slice(0, len).forEach((m) => {
              m = m.default || m;
              if (!Array.isArray(m)) {
                m = [m];
              }
              m.map(_ => registerModel(app, _));
            });
            resolve(ret[len]);
          }
        });
      });
    },
    ...config,
  });
}
```
**2. asyncComponent**
asyncComponent 方法接收 dynamic 方法传入的 config 对象，然后返回一个 class component。
- 首先来看 constructor 方法，它初始化了 this.LoadingComponent 这个是用于在组件加载完之前显示的，还有 AsyncComponent 这个 state 它表示要渲染的异步组件初始值为 null，最后调用 load 方法
- load 方法会调用传入的 resolve 方法（上面讲过），然后调用 then(m) m 就是真正要加载的组件，将 m 赋值给 AsyncComponent，判断 mounted 是否为真（在 componentDidMount 里面赋值为真）如果为真则 setState AsyncComponent，否则在 state 上面直接修改 AsyncComponent 这样不会触发组件重新渲染
- 最后来看 render 方法，这个方法判断当 AsyncComponent 有值时则渲染它，无值时就渲染 this.LoadingComponent
```javascript
function asyncComponent(config) {
  const { resolve } = config;

  return class DynamicComponent extends Component {
    constructor(...args) {
      super(...args);
      this.LoadingComponent =
        config.LoadingComponent || defaultLoadingComponent;
      this.state = {
        AsyncComponent: null,
      };
      this.load();
    }

    componentDidMount() {
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    load() {
      resolve().then((m) => {
        const AsyncComponent = m.default || m;
        if (this.mounted) {
          this.setState({ AsyncComponent });
        } else {
          this.state.AsyncComponent = AsyncComponent; // eslint-disable-line
        }
      });
    }

    render() {
      const { AsyncComponent } = this.state;
      const { LoadingComponent } = this;
      if (AsyncComponent) return <AsyncComponent {...this.props} />;

      return <LoadingComponent {...this.props} />;
    }
  };
}
```
**3. setDefaultLoadingComponent**  
另外通过阅读源码还发现了 dynamic 还附加了一个方法 setDefaultLoadingComponent 可以设置 defaultLoadingComponent，这个是在文档上没有说明的。
```javascript
dynamic.setDefaultLoadingComponent = (LoadingComponent) => {
  defaultLoadingComponent = LoadingComponent;
};
```
