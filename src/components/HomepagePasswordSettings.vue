<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close'])

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const hasPassword = ref(false)

const canSubmit = ref(false)

// 检查表单是否可提交
const checkCanSubmit = () => {
  canSubmit.value = newPassword.value.trim().length >= 6 && 
                   newPassword.value === confirmPassword.value &&
                   !loading.value
}

// 监听密码输入
const handlePasswordInput = () => {
  error.value = ''
  success.value = ''
  checkCanSubmit()
}

const fetchPasswordStatus = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get('/api/admin/homepage-password/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    hasPassword.value = response.data.has_password
  } catch (err) {
    console.error('获取密码状态失败:', err)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = '密码长度至少6位'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const token = localStorage.getItem('admin_token')
    await axios.post('/api/admin/homepage-password', {
      password: newPassword.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    success.value = '首页密码设置成功！'
    hasPassword.value = true
    
    // 清空表单
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    setTimeout(() => {
      emit('close')
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.detail || '设置失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPasswordStatus()
})
</script>

<template>
  <!-- 模态框背景 -->
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg max-w-md w-full" @click.stop>
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ hasPassword ? '修改首页密码' : '设置首页密码' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-6">
        <div class="space-y-4">
          <div v-if="hasPassword" class="p-4 bg-blue-50 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  当前已设置首页访问密码，用户需要输入密码才能访问首页
                </p>
              </div>
            </div>
          </div>

          <div v-else class="p-4 bg-yellow-50 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  尚未设置首页访问密码，用户可以直接访问首页
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
                {{ hasPassword ? '新密码' : '设置密码' }}
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                @input="handlePasswordInput"
                type="password"
                placeholder="请输入新密码（至少6位）"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                :disabled="loading"
                required
              />
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                @input="handlePasswordInput"
                type="password"
                placeholder="请再次输入密码"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                :disabled="loading"
                required
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
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>

            <div v-if="success" class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-green-700">{{ success }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
        <button
          @click="$emit('close')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          :disabled="loading"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          type="submit"
          :disabled="!canSubmit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            设置中...
          </span>
          <span v-else>{{ hasPassword ? '更新密码' : '设置密码' }}</span>
        </button>
      </div>
    </div>
  </div>
</template> 