<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  cars: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['car-deleted', 'car-updated'])

const loading = ref({})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getImageUrl = (car) => {
  return car.image_base64 || ''
}

const isValidBase64Image = (base64String) => {
  return base64String && base64String.startsWith('data:image/')
}

const deleteCar = async (carId) => {
  if (!confirm('确定要删除这辆车吗？此操作不可恢复。')) {
    return
  }
  
  loading.value[carId] = true
  
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`/api/cars/${carId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    emit('car-deleted', carId)
  } catch (error) {
    console.error('删除失败:', error)
    if (error.response?.status === 401) {
      alert('认证失败，请重新登录')
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    } else {
      alert('删除失败：' + (error.response?.data?.detail || error.message))
    }
  } finally {
    delete loading.value[carId]
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">车辆列表</h3>
      <p class="text-sm text-gray-600 mt-1">共 {{ cars.length }} 辆车</p>
    </div>

    <!-- 表格视图 - 桌面端 -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              车辆信息
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              区域
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              联系方式
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="car in cars" :key="car.id" class="hover:bg-gray-50">
            <!-- 车辆信息 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-16 w-24">
                  <img
                    v-if="isValidBase64Image(car.image_base64)"
                    :src="getImageUrl(car)"
                    :alt="car.description || '车辆图片'"
                    class="h-16 w-24 object-cover rounded-lg"
                  />
                  <div
                    v-else
                    class="h-16 w-24 bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <div class="text-gray-400 text-xs">📷</div>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    车辆 #{{ car.id }}
                  </div>
                  <div class="text-sm text-gray-500 max-w-xs truncate">
                    {{ car.description || '暂无描述' }}
                  </div>
                </div>
              </div>
            </td>

            <!-- 区域 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ car.region }}
              </span>
            </td>

            <!-- 联系方式 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <span class="text-sm text-gray-900">{{ car.contact }}</span>
                <button
                  @click="copyToClipboard(car.contact)"
                  class="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="复制联系方式"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </td>

            <!-- 创建时间 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(car.created_at) }}
            </td>

            <!-- 操作 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button
                  @click="$emit('car-updated', car)"
                  class="text-blue-600 hover:text-blue-700 transition-colors"
                  title="编辑"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteCar(car.id)"
                  :disabled="loading[car.id]"
                  class="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  title="删除"
                >
                  <svg v-if="loading[car.id]" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 卡片视图 - 移动端 -->
    <div class="md:hidden divide-y divide-gray-200">
      <div v-for="car in cars" :key="car.id" class="p-6">
        <div class="flex items-start space-x-4">
          <img
            v-if="isValidBase64Image(car.image_base64)"
            :src="getImageUrl(car)"
            :alt="car.description || '车辆图片'"
            class="w-20 h-16 object-cover rounded-lg flex-shrink-0"
          />
          <div
            v-else
            class="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <div class="text-gray-400 text-xs">📷</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900">车辆 #{{ car.id }}</h4>
            </div>
            
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">
              {{ car.description || '暂无描述' }}
            </p>
            
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center text-gray-500">
                <span>{{ car.contact }}</span>
                <button
                  @click="copyToClipboard(car.contact)"
                  class="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
              <span class="text-gray-400">{{ formatDate(car.created_at) }}</span>
            </div>
            
            <div class="flex items-center space-x-3 mt-3">
              <button
                @click="$emit('car-updated', car)"
                class="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="deleteCar(car.id)"
                :disabled="loading[car.id]"
                class="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <svg v-if="loading[car.id]" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 