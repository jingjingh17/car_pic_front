<script setup>
import { ref } from 'vue'

defineProps({
  cars: {
    type: Array,
    required: true
  }
})

defineEmits(['car-click'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 图片错误处理
const imageErrors = ref(new Set())

const getImageUrl = (car) => {
  // BASE64存储直接返回image_base64数据
  return car.image_base64
}

const handleImageError = (car) => {
  imageErrors.value.add(car.id)
  console.error('图片加载失败:', car.id)
}

const isValidBase64Image = (base64String) => {
  return base64String && base64String.startsWith('data:image/')
}
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
        <!-- 图片 -->
        <div class="aspect-w-16 aspect-h-12 bg-gray-100 overflow-hidden relative">
          <img
            v-if="isValidBase64Image(car.image_base64) && !imageErrors.has(car.id)"
            :src="getImageUrl(car)"
            :alt="`${car.region}车辆图片`"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            @error="handleImageError(car)"
          />
          
          <!-- 图片加载失败或无效时显示 -->
          <div v-if="!isValidBase64Image(car.image_base64) || imageErrors.has(car.id)" class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div class="text-center">
              <div class="text-gray-400 text-2xl mb-2">📷</div>
              <p class="text-gray-500 text-sm">图片无法显示</p>
            </div>
          </div>
          

        </div>
        
        <!-- 信息 -->
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