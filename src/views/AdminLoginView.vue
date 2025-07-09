<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.post('/api/admin/login', {
      username: form.value.username,
      password: form.value.password
    })

    // 保存token到localStorage
    localStorage.setItem('admin_token', response.data.access_token)
    
    // 跳转到管理后台
    router.push('/admin')
    
  } catch (err) {
    error.value = err.response?.data?.detail || '登录失败'
  } finally {
    loading.value = false
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  handleLogin()
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          管理员登录
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请输入管理员账号和密码
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入用户名"
              :disabled="loading"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入密码"
              :disabled="loading"
            />
          </div>
        </div>

        <div v-if="error" class="text-center">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </div>

        <div class="text-center">
          <router-link 
            to="/" 
            class="text-sm text-blue-600 hover:text-blue-500"
          >
            返回首页
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template> 