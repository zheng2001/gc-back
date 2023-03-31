import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index'
import Cookies from 'js-cookie'

Vue.use(VueRouter)

const routes = [
  //  ====  登录  ====
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  //  ====== 主页  =====
  {
    path: '/',
    name: 'Index',
    component: Index,
    redirect:'/home',
    children:[
      //  ====  首页  ====
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Home.vue'),
        meta: {
          title: '首页'
        }

      },
      //  ====  Admin  ====
      {
        path: 'adminList',
        name: 'AdminList',
        component: () => import('@/views/admin/List.vue'),
        meta: {
          title: '管理员列表'
        }
      },
      {
        path: 'addAdmin',
        name: 'AddAdmin',
        component: () => import('@/views/admin/Add.vue'),
        meta: {
          title: '添加管理员'
        }
      },
      //  ====  User  ====
      {
        path: 'userList',
        name: 'UserList',
        component: () => import('@/views/user/List.vue'),
        meta: {
          title: '用户列表'
        }
      },
      {
        path: 'addUser',
        name: 'AddUser',
        component: () => import('@/views/user/Add.vue'),
        meta: {
          title: '添加用户'
        }
      },
      //  ====  Tag  ====
      {
        path: 'tagList',
        name: 'tagList',
        component: () => import('@/views/tag/List.vue'),
        meta: {
          title: '标签列表'
        }
      },
      //  ====  Banner  ====
      {
        path: 'bannerList',
        name: 'bannerList',
        component: () => import('@/views/banner/List.vue'),
        meta: {
          title: '轮播图列表'
        }
      },
      //  ====  Essay  ====
      {
        path: 'essayList',
        name: 'essayList',
        component: () => import('@/views/essay/List.vue'),
        meta: {
          title: '文章列表'
        }
      }
    ]
  },
  {
    path: "*",
    name: '404',
    component:()=>import('@/views/404'),
    meta: {
      title: '404 找不到页面'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to,from,next)=>{
  if (to.path === '/login') next()
  const admin = Cookies.get("admin")
  if (!admin && to.path!='/login') return next("/login") // 强制退回登录页面
  // 访问 /home 的时候，并且cookie里面存在数据，就直接放行
  next()
})

router.afterEach((to, from) => {
  document.title = to.meta.title //在全局后置守卫中获取路由元信息设置title
})


export default router
