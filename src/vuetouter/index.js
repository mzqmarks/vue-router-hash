let _Vue = null
export default class VueRouter {
    static install (Vue) {
        // 1. 判断插件是否安装
        if(VueRouter.install.installed) {
            return
        }
        VueRouter.install.installed = true
        // 2. 把Vue 构造函数记录到全局变量
        _Vue = Vue
        // 3. 把创建Vue 实例时候传入的 router对象 注入到Vue 实例上
        _Vue.mixin({
            beforeCreate() {
                if(this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })
    }

    constructor (options) {
        this.options = options
        this.routeMap = {}
        this.data = _Vue.observable({
            current: '/'
        })
    }

    init () {
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent()
    }

    createRouteMap () {
        // 遍历所有路由规则， 把路由规则解析成键值对的形式 存储到routerMap 中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        })
    }

    initComponents (Vue) {
        Vue.component('router-link', {
            props: {
                to: String
            },
            // template: `<a :href="to"><solt></solt></a>`
            render (h) {
                return h('a', {
                    attrs: {
                        href: '#'+this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler (e) {
                    window.location.hash = this.to
                    this.$router.data.current = this.to
                    e.preventDefault();
                }
            },
        })

        const self = this
        Vue.component('router-view', {
            render (h) {
                const component = self.routeMap[self.data.current]
                return h(component)
            }
        })
    }

    initEvent () {
        window.addEventListener('hashchange', () => {
            this.data.current = window.location.hash.substr(1) // 为响应式路由赋值
        })
    }
}