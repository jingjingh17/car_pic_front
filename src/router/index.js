import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import PasswordLoginView from '../views/PasswordLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresHomepageAuth: true }
    },
    {
      path: '/login',
      name: 'password-login',
      component: PasswordLoginView
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true }
    }
  ],
})

// 检查首页访问权限
const checkHomepageAccess = () => {
  const hasAccess = sessionStorage.getItem('homepage_access')
  const accessTime = sessionStorage.getItem('homepage_access_time')
  
  // 如果没有访问记录，返回false
  if (!hasAccess || hasAccess !== 'true') {
    console.log('没有访问权限记录')
    return false
  }
  
  if (!accessTime) {
    console.log('没有访问时间记录')
    return false
  }
  
  // 检查是否超时（24小时）
  const currentTime = Date.now()
  const storedTime = parseInt(accessTime)
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  if (isNaN(storedTime)) {
    console.log('访问时间格式错误')
    sessionStorage.removeItem('homepage_access')
    sessionStorage.removeItem('homepage_access_time')
    return false
  }
  
  const timeElapsed = currentTime - storedTime
  console.log(`时间检查: 当前时间=${currentTime}, 存储时间=${storedTime}, 已过时间=${timeElapsed}, 24小时=${twentyFourHours}`)
  
  if (timeElapsed > twentyFourHours) {
    console.log('访问权限已过期，清除会话')
    // 超时，清除访问权限
    sessionStorage.removeItem('homepage_access')
    sessionStorage.removeItem('homepage_access_time')
    return false
  }
  
  console.log('访问权限验证通过')
  return true
}

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log(`路由导航: 从 ${from.path} 到 ${to.path}`)
  
  // 检查管理员权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      console.log('管理员未登录，跳转到登录页')
      next('/admin/login')
    } else {
      console.log('管理员已登录，允许访问')
      next()
    }
    return
  }
  
  // 检查首页访问权限
  if (to.matched.some(record => record.meta.requiresHomepageAuth)) {
    console.log('检查首页访问权限...')
    if (!checkHomepageAccess()) {
      console.log('首页访问权限验证失败，跳转到密码验证页')
      next('/login')
    } else {
      console.log('首页访问权限验证成功，允许访问')
      next()
    }
    return
  }
  
  // 其他路由直接允许
  console.log('其他路由，直接允许访问')
  next()
})

export default router
