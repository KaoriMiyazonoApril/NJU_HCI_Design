// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            component: () => import('../views/account/Login.vue'),
            meta: { title: '用户登录' }
        },
        {
            path: '/register',
            component: () => import('../views/account/Register.vue'),
            meta: { title: '用户注册' }
        },
        {
            path: '/home',
            redirect: '/dashboard',
            component: () => import('../views/Home.vue'),
            children: [
                {
                    path: '/dashboard/:username',
                    name: 'Dashboard',
                    component: () => import('../views/account/DashBoard.vue'),
                    meta: { title: '个人信息' }
                },
                {
                    path: '/blank',
                    name: 'BlankPage',
                    component: () => import('../views/account/BlankPage.vue'),
                    meta: { title: '空白页' }
                },
                {
                    path: '/allproduct',
                    name: '/AllProduct',
                    component: () => import('../views/product/AllProduct.vue'),
                    meta: { title: '商品列表' }
                },
                {
                    path: '/createproduct',
                    name: '/CreateProduct',
                    component: () => import('../views/product/CreateProduct.vue'),
                    meta: { title: '创建商品' }
                },
                {
                    path: '/products/:id',
                    name: 'ProductDetail',
                    component: () => import('../views/product/ProductDetail.vue'),
                    meta: { title: '商品详细信息' }
                },
                {
                    path: "/product/:id/edit-stock",
                    name: "StockEdit",
                    component: () => import('../views/product/StockEdit.vue'),
                    meta: { title: '商品库存编辑' }
                },
                {
                    path: '/cart', // 购物车页面路由
                    name: 'Cart',
                    component: () => import('../views/cart/Cart.vue'),
                    meta: { title: '购物车' }
                },
                {
                    path: 'orders/:orderId/pay',
                    name: 'Order',
                    component: () => import('../views/order/Order.vue'),
                    meta: { title: '支付' }
                },
                {
                    path: '/alladvertisements',
                    name: 'AllAdvertisements',
                    component: () => import('../views/advertisement/AllAdvertisements.vue'),
                    meta: { title: '广告列表' }
                },
                {
                    path: '/createadvertisement',
                    name: 'CreateAdvertisement',
                    component: () => import('../views/advertisement/CreateAdvertisement.vue'),
                    meta: { title: '创建广告' }
                },
                {
                    path: '/editadvertisement/:id',
                    name: 'EditAdvertisement',
                    component: () => import('../views/advertisement/EditAdvertisement.vue'),
                    meta: { title: '编辑广告' }
                }




            ]
        },


        {
            path: '/404',
            name: '404',
            component: () => import('../views/NotFound.vue'),
            meta: { title: '404' }
        },
        {
            path: '/:catchAll(.*)',
            redirect: '/404'
        }
    ]
});

router.beforeEach((to, _, next) => {
    const token: string | null = sessionStorage.getItem('token')
    const role: string | null = sessionStorage.getItem('role')

    if (to.meta.title) {
        document.title = to.meta.title
    }

    if (!token) {
        if (to.path === '/login' || to.path === '/register') {
            next()
        } else {
            next('/login')
        }
        return
    }

    if (to.meta.permission && !to.meta.permission.includes(role!)) {
        next('/404')
        return
    }


    next()
})

export { router };