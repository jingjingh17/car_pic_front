<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

const password = ref('')
const isVerified = ref(false)
const loading = ref(false)
const error = ref('')
const carDetails = ref(null)
const imageError = ref(false)

const canSubmit = computed(() => {
  return password.value.trim().length > 0 && !loading.value
})

// 图片URL处理
const getImageUrl = (car) => {
  if (!car || !car.image_base64) return ''
  return car.image_base64
}

const isValidBase64Image = (base64String) => {
  return base64String && base64String.startsWith('data:image/')
}

const handleImageError = (car) => {
  imageError.value = true
  console.error('图片加载失败:', car?.id)
}

const verifyPassword = async () => {
  if (!canSubmit.value) return

  loading.value = true
  error.value = ''
  
  try {
    await axios.post(`/api/cars/${props.car.id}/verify`, {
      password: password.value
    })
    
    // 验证成功后获取详情
    const response = await axios.get(`/api/cars/${props.car.id}/details`)
    carDetails.value = response.data
    isVerified.value = true
    
  } catch (err) {
    error.value = err.response?.data?.detail || '密码错误'
  } finally {
    loading.value = false
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  verifyPassword()
}

const emit = defineEmits(['close'])

const handleClose = () => {
  password.value = ''
  isVerified.value = false
  error.value = ''
  carDetails.value = null
  imageError.value = false
  emit('close')
}
</script>

<template>
  <!-- 模态框背景 -->
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col" @click.stop>
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b flex-shrink-0">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ car.region }} - 车辆详情
          <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            BASE64
          </span>
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

      <!-- 内容 - 可滚动区域 -->
      <div class="p-6 overflow-y-auto flex-1">
        <!-- 未验证状态 - 密码输入 -->
        <div v-if="!isVerified" class="text-center">
          <div class="mb-6 relative">
            <img
              v-if="isValidBase64Image(car.image_base64)"
              :src="getImageUrl(car)"
              :alt="`${car.region}车辆图片`"
              class="w-full max-w-md mx-auto rounded-lg blur-lg"
              @error="handleImageError(car)"
            />
            
            <!-- 图片无效或加载失败时显示 -->
            <div v-if="!isValidBase64Image(car.image_base64) || imageError" class="w-full max-w-md mx-auto h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div class="text-center">
                <div class="text-gray-400 text-2xl mb-2">📷</div>
                <p class="text-gray-500 text-sm">图片无法显示</p>
              </div>
            </div>
            
            <p class="mt-4 text-gray-600">请输入密码查看完整信息</p>
          </div>

          <form @submit="handleSubmit" class="max-w-sm mx-auto">
            <div class="mb-4">
              <input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                :disabled="loading"
              />
              <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
            </div>
            
            <button
              type="submit"
              :disabled="!canSubmit"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                验证中...
              </span>
              <span v-else>确认</span>
            </button>
          </form>
        </div>

        <!-- 已验证状态 - 显示详细信息 -->
        <div v-else class="space-y-6">
          <!-- 图片 -->
          <div class="text-center relative">
            <img
              v-if="isValidBase64Image(carDetails.image_base64)"
              :src="getImageUrl(carDetails)"
              :alt="`${carDetails.region}车辆图片`"
              class="w-full max-w-lg mx-auto rounded-lg shadow-lg"
              @error="handleImageError(carDetails)"
            />
            
            <!-- 图片无效或加载失败时显示 -->
            <div v-if="!isValidBase64Image(carDetails.image_base64) || imageError" class="w-full max-w-lg mx-auto h-96 flex items-center justify-center bg-gray-100 rounded-lg">
              <div class="text-center">
                <div class="text-gray-400 text-3xl mb-2">📷</div>
                <p class="text-gray-500 text-sm">图片无法显示</p>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="bg-gray-50 rounded-lg p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">区域</label>
                <p class="text-sm text-gray-900">{{ carDetails.region }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系方式</label>
                <p class="text-sm text-gray-900">{{ carDetails.contact }}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <p class="text-sm text-gray-900">{{ carDetails.description || '暂无描述' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
              <p class="text-sm text-gray-900">{{ new Date(carDetails.created_at).toLocaleString('zh-CN') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="flex justify-end p-6 border-t flex-shrink-0">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template> 