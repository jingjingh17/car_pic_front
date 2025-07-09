<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const password = ref('')
const loading = ref(false)
const error = ref('')

// 检查是否已经有有效的会话
const checkExistingSession = () => {
  const hasAccess = sessionStorage.getItem('homepage_access')
  const accessTime = sessionStorage.getItem('homepage_access_time')
  
  if (hasAccess === 'true' && accessTime) {
    const currentTime = Date.now()
    const storedTime = parseInt(accessTime)
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (!isNaN(storedTime) && (currentTime - storedTime) < twentyFourHours) {
      console.log('检测到有效会话，自动跳转到首页')
      router.replace('/')
      return true
    }
  }
  return false
}

const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = '请输入访问密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('开始验证首页密码...')
    await axios.post('/api/homepage/verify', {
      password: password.value
    })

    console.log('密码验证成功，设置会话...')
    // 验证成功，保存到sessionStorage并跳转到首页
    const currentTime = Date.now()
    sessionStorage.setItem('homepage_access', 'true')
    sessionStorage.setItem('homepage_access_time', currentTime.toString())
    
    console.log(`会话已设置: homepage_access=true, homepage_access_time=${currentTime}`)
    
    // 使用 replace 而不是 push，避免用户返回到登录页
    router.replace('/')
    
  } catch (err) {
    console.error('密码验证失败:', err)
    error.value = err.response?.data?.detail || '密码错误'
  } finally {
    loading.value = false
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  handleLogin()
}

// 组件挂载时检查现有会话
onMounted(() => {
  checkExistingSession()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          车辆图片管理系统
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请输入访问密码进入系统
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit="handleSubmit">
        <div>
          <label for="password" class="sr-only">访问密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="请输入访问密码"
            :disabled="loading"
            @keyup.enter="handleLogin"
          />
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !password.trim()"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="!loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-blue-300 group-hover:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3.053 0-5.789-3.201-5.789-4.5 0-1.299 2.736-4.5 5.789-4.5a6 6 0 016 6z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"></path>
              </svg>
            </span>
            {{ loading ? '验证中...' : '进入系统' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            忘记密码？请联系管理员
          </p>
        </div>
      </form>
    </div>
  </div>
</template> 