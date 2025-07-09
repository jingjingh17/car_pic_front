<script setup>
import { computed, ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const carDetails = ref(null)
const imageLoading = ref(true)
const imageError = ref(false)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getImageUrl = (carData) => {
  return carData?.image_base64
}

const isValidBase64Image = (base64String) => {
  return base64String && base64String.startsWith('data:image/')
}

const handleImageError = () => {
  imageError.value = true
  imageLoading.value = false
}

// 获取车辆详情（包含图片）
const fetchCarDetails = async () => {
  try {
    imageLoading.value = true
    imageError.value = false
    
    const response = await axios.get(`/api/cars/${props.car.id}/details`)
    carDetails.value = response.data
    imageLoading.value = false
  } catch (error) {
    console.error('获取车辆详情失败:', error)
    imageError.value = true
    imageLoading.value = false
  }
}

// 监听car属性变化，重新获取详情
watch(() => props.car, (newCar) => {
  if (newCar) {
    fetchCarDetails()
  }
}, { immediate: true })
</script>

<template>
  <!-- 模态框背景 -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="$emit('close')">
    <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">车辆详情</h2>
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
        <!-- 车辆详情 -->
        <div class="space-y-6">
          <!-- 图片 -->
          <div class="text-center">
            <!-- 图片加载中 -->
            <div v-if="imageLoading" class="w-full max-w-lg mx-auto h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p class="text-gray-500 text-sm">加载图片中...</p>
              </div>
            </div>
            
            <!-- 图片显示 -->
            <img
              v-else-if="!imageError && carDetails && isValidBase64Image(carDetails.image_base64)"
              :src="getImageUrl(carDetails)"
              :alt="`${car.region}车辆图片`"
              class="w-full max-w-lg mx-auto rounded-lg shadow-md"
              @error="handleImageError"
            />
            
            <!-- 图片加载失败 -->
            <div v-else class="w-full max-w-lg mx-auto h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div class="text-center">
                <div class="text-gray-400 text-2xl mb-2">📷</div>
                <p class="text-gray-500 text-sm">图片无法显示</p>
              </div>
            </div>
          </div>

          <!-- 车辆信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">基本信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">车辆编号:</span>
                    <span class="font-medium">#{{ car.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">所在区域:</span>
                    <span class="font-medium">{{ car.region }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">发布时间:</span>
                    <span class="font-medium">{{ new Date(car.created_at).toLocaleDateString('zh-CN') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  联系方式
                </h4>
                <div class="text-center py-2">
                  <span class="text-blue-800 font-bold text-xl">{{ car.contact || '暂无联系方式' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 车辆描述 -->
          <div v-if="car.description" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">车辆描述</h4>
            <p class="text-gray-700 text-sm leading-relaxed">{{ car.description }}</p>
          </div>
          <div v-else class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">车辆描述</h4>
            <p class="text-gray-500 text-sm italic">暂无详细描述</p>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="px-6 py-4 bg-gray-50 border-t flex justify-end">
        <button
          @click="$emit('close')"
          class="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template> 