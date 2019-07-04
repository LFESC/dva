(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{10:function(t,e,a){"use strict";function s(t,e,a,s,r,n,o,c){var p,i="function"==typeof t?t.options:t;if(e&&(i.render=e,i.staticRenderFns=a,i._compiled=!0),s&&(i.functional=!0),n&&(i._scopeId="data-v-"+n),o?(p=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),r&&r.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(o)},i._ssrRegister=p):r&&(p=c?function(){r.call(this,this.$root.$options.shadowRoot)}:r),p)if(i.functional){i._injectStyles=p;var v=i.render;i.render=function(t,e){return p.call(e),v(t,e)}}else{var _=i.beforeCreate;i.beforeCreate=_?[].concat(_,p):[p]}return{exports:t,options:i}}a.d(e,"a",function(){return s})},189:function(t,e,a){"use strict";a.r(e);var s=a(10),r=Object(s.a)({},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"解答"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#解答","aria-hidden":"true"}},[t._v("#")]),t._v(" 解答")]),t._v(" "),a("h2",{attrs:{id:"_1-dva-opts-和-app-use-hooks-这些-hooks-是怎么发挥作用的"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-dva-opts-和-app-use-hooks-这些-hooks-是怎么发挥作用的","aria-hidden":"true"}},[t._v("#")]),t._v(" 1. "),a("code",[t._v("dva(opts)")]),t._v(" 和 "),a("code",[t._v("app.use(hooks)")]),t._v(" 这些 hooks 是怎么发挥作用的")]),t._v(" "),a("ul",[a("li",[t._v("onError: onError 会在 model.effects 执行的时候去处理捕获的错误，还有就是作为 subscription 的第二个参数，可以手动调用。涉及的源码有 "),a("router-link",{attrs:{to:"/dva/api/getSaga.html#getwatcher"}},[t._v("getSaga")]),t._v(" 和 "),a("router-link",{attrs:{to:"/dva/api/subscription.html#run"}},[t._v("subscription")])],1),t._v(" "),a("li",[t._v("onAction: onAction 其实就是 redux 的 middleware，所以它在 "),a("router-link",{attrs:{to:"/dva/api/createStore.html"}},[t._v("createStore")]),t._v(" 生成 middleware 的时候调用")],1),t._v(" "),a("li",[t._v("onStateChange: onStateChange 会在 "),a("code",[t._v("core.create()")]),t._v(" 生成的 app 对象的 "),a("router-link",{attrs:{to:"/dva/api/core-create.html#start"}},[t._v("start")]),t._v(" 方法里面调用，dva 会调用 store.subscribe 设置 store 改变时的监听器，这个监听器就是 onStateChange")],1),t._v(" "),a("li",[t._v("onReducer: onReducer 用来封装 reducer，它接收整个 reducer 方法，你可以在调用 reducer 前后做一些事情，它是在 "),a("router-link",{attrs:{to:"/dva/api/core-create.html#其它"}},[t._v("createReducer")]),t._v(" 方法生成 reducer 的时候调用的")],1),t._v(" "),a("li",[t._v("onEffect: onEffect 是在执行 saga 时调用的，在 "),a("router-link",{attrs:{to:"/dva/api/getSaga.html#getwatcher"}},[t._v("sagaWithOnEffect")]),t._v(" 这个方法里面调用 onEffect，把真正的 effect model action 做为参数传给 onEffect，这样你就可以自定义 effect 的执行")],1),t._v(" "),a("li",[t._v("extraReducers: extraReducers 是在 "),a("router-link",{attrs:{to:"/dva/api/core-create.html#其它"}},[t._v("createReducer")]),t._v(" 里面调用的，这个方法会将内置的 reducer 和 额外的 reducers(extraReducers) 通过 combineReducers 方法合并为一个 reducer；createReducer 会在 app.start app.model app.unmodel app.replaceModel 这几个 api 里面调用")],1),t._v(" "),a("li",[t._v("_handleActions: 这个文档里面没有提到，我也是看了源码才知道，它的作用是替代默认的 "),a("router-link",{attrs:{to:"/dva/api/handleActions.html"}},[t._v("handleActions")]),t._v(" 来生成 reducer，目前我知道只有 "),a("router-link",{attrs:{to:"/dva-immer/"}},[t._v("dva-immer")]),t._v(" 里面用到了")],1)]),t._v(" "),a("h2",{attrs:{id:"_2-为何-dispatch-的-action-type-要加上-namespace"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-为何-dispatch-的-action-type-要加上-namespace","aria-hidden":"true"}},[t._v("#")]),t._v(" 2. 为何 dispatch 的 action type 要加上 namespace")]),t._v(" "),a("p",[t._v("在我们调用 app.model(m) 时会进入 "),a("router-link",{attrs:{to:"/dva/api/core-create.html#model"}},[t._v("model")]),t._v(" 方法，在这个方法里面会调用 prefixNamespace 方法去给 reducers 和 effects 加上前缀 "),a("code",[t._v("${namespace}${NAMESPACE_SEP}")]),t._v(" 所以当你在组件里面 dispatch 的时候要加上前缀，具体是怎么加的可以去看 "),a("router-link",{attrs:{to:"/dva/api/prefixNamespace.html"}},[t._v("prefixNamespace")]),t._v("这篇。")],1),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),a("p",[t._v("如果你在 effects 内部调用 put 去触发一个 action 则不需要加前缀，因为 dva 会帮你自动加上，详情可以去看 "),a("router-link",{attrs:{to:"/dva/api/getSaga.html"}},[t._v("getSaga")]),t._v(" 的 createEffects 方法。")],1)]),t._v(" "),a("div",{staticClass:"language-javascript extra-class"},[a("pre",{pre:!0,attrs:{class:"language-javascript"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("model")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("m")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("process"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("env"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("NODE_ENV")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'production'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("checkModel")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("m"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" app"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_models"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" prefixedModel "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("prefixNamespace")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("...")]),t._v("m "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  app"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_models"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("prefixedModel"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" prefixedModel"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("h2",{attrs:{id:"_3-在一个-model-里面可否调用其它-model-的-effects-和-reducers"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-在一个-model-里面可否调用其它-model-的-effects-和-reducers","aria-hidden":"true"}},[t._v("#")]),t._v(" 3. 在一个 model 里面可否调用其它 model 的 effects 和 reducers")]),t._v(" "),a("p",[t._v("通过第二个问题我们知道当在 effect put 一个 action 的时候 dva 会自动给 type 加上前缀 "),a("code",[t._v("${namespace}${NAMESPACE_SEP}")]),t._v(" 但是如果加上前缀的 type 并不在当前 model 内则会使用原 type，所以我们是可以在一个 model 里面调用另一个 model 的 effects 和 reducers 的。")]),t._v(" "),a("h2",{attrs:{id:"_4-为何-dispatch-方法能返回-promise"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-为何-dispatch-方法能返回-promise","aria-hidden":"true"}},[t._v("#")]),t._v(" 4. 为何 dispatch 方法能返回 promise")]),t._v(" "),a("p",[t._v("在 dva 调用 "),a("router-link",{attrs:{to:"/dva/createStore.html"}},[t._v("createStore")]),t._v(" 创建 redux store 时设置了一些 middlewares，其中有一个叫 promiseMiddleware 的中间件，它的作用就是当 dispatch 一个 effects 时返回一个 promise，但是这里它做了判断只有 effects 会返回 promise，详情可以去看 "),a("router-link",{attrs:{to:"/dva/api/middleware.html#promisemiddleware"}},[t._v("middleware")]),t._v(" 的解析。")],1)])},[],!1,null,null,null);e.default=r.exports}}]);