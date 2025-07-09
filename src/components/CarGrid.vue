<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  cars: {
    type: Array,
    required: true
  }
})

defineEmits(['car-click'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 图片加载状态管理
const loadingImages = ref(new Set())
const loadedImages = ref(new Set())
const errorImages = ref(new Set())

// 预加载所有缩略图
const preloadThumbnails = async () => {
  for (const car of props.cars) {
    const carId = car.id.toString()
    
    if (car.thumbnail_base64 && !loadedImages.value.has(carId) && !errorImages.value.has(carId)) {
      loadingImages.value.add(carId)
      
      try {
        // 创建图片对象来预加载
        const img = new Image()
        img.onload = () => {
          loadedImages.value.add(carId)
          loadingImages.value.delete(carId)
        }
        img.onerror = () => {
          errorImages.value.add(carId)
          loadingImages.value.delete(carId)
        }
        img.src = car.thumbnail_base64
      } catch (error) {
        console.error('预加载缩略图失败:', error)
        errorImages.value.add(carId)
        loadingImages.value.delete(carId)
      }
    }
  }
}

// 获取图片显示状态
const getImageStatus = (car) => {
  const carId = car.id.toString()
  
  if (!car.thumbnail_base64) {
    return 'error'
  }
  
  if (errorImages.value.has(carId)) {
    return 'error'
  }
  
  if (loadedImages.value.has(carId)) {
    return 'loaded'
  }
  
  if (loadingImages.value.has(carId)) {
    return 'loading'
  }
  
  return 'pending'
}

// 获取缩略图URL
const getThumbnailUrl = (car) => {
  return car.thumbnail_base64 || ''
}

onMounted(() => {
  // 组件挂载时立即预加载所有缩略图
  preloadThumbnails()
})

// 监听cars数据变化，重新预加载
import { watch } from 'vue'
watch(() => props.cars, () => {
  // 清空之前的状态
  loadingImages.value.clear()
  loadedImages.value.clear()
  errorImages.value.clear()
  
  // 重新预加载
  preloadThumbnails()
}, { deep: true })
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div v-if="cars.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-xl mb-2">🚗</div>
      <p class="text-gray-500">暂无车辆数据</p>
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="car in cars"
        :key="car.id"
        @click="$emit('car-click', car)"
        class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      >
        <!-- 图片区域 -->
        <div class="aspect-w-16 aspect-h-12 bg-gray-100 overflow-hidden relative h-48">
          <!-- 加载中状态 -->
          <div 
            v-if="getImageStatus(car) === 'loading'"
            class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100"
          >
            <div class="text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p class="text-blue-600 text-sm">加载中...</p>
            </div>
          </div>
          
          <!-- 图片显示 -->
          <img
            v-else-if="getImageStatus(car) === 'loaded'"
            :src="getThumbnailUrl(car)"
            :alt="`${car.region}车辆图片`"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          
          <!-- 错误状态 -->
          <div 
            v-else
            class="absolute inset-0 flex items-center justify-center bg-red-50"
          >
            <div class="text-center">
              <div class="text-red-400 text-2xl mb-2">❌</div>
              <p class="text-red-500 text-sm">图片无法显示</p>
            </div>
          </div>
          
          <!-- 图片大小指示器（开发时可见） -->
          <div 
            v-if="getImageStatus(car) === 'loaded'"
            class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {{ Math.round(getThumbnailUrl(car).length / 1024) }}KB
          </div>
        </div>
        
        <!-- 信息区域 -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ car.region }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatDate(car.created_at) }}
            </span>
          </div>
          
          <p v-if="car.description" class="text-sm text-gray-600 line-clamp-2">
            {{ car.description }}
          </p>
          <p v-else class="text-sm text-gray-400 italic">
            暂无描述
          </p>
          
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-gray-500">点击查看详情</span>
            <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
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