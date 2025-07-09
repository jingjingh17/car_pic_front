<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import axios from 'axios'
import RegionSelector from '../components/RegionSelector.vue'
import CarGrid from '../components/CarGrid.vue'
import CarModal from '../components/CarModal.vue'

const selectedRegion = ref('')
const cars = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const showModal = ref(false)
const selectedCar = ref(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const total = ref(0)

const regions = [
  '全部', '福田', '罗湖', '南山', '龙华', '龙岗', '宝安', '沙井', '广州'
]

const filteredCars = computed(() => {
  if (!selectedRegion.value || selectedRegion.value === '全部') {
    return cars.value
  }
  return cars.value.filter(car => car.region === selectedRegion.value)
})

// 获取车辆列表
const fetchCars = async (page = 1, append = false) => {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  try {
    const params = {
      page,
      limit: pageSize.value
    }
    
    // 如果有选中区域且不是"全部"，添加区域参数
    if (selectedRegion.value && selectedRegion.value !== '全部') {
      params.region = selectedRegion.value
    }
    
    const response = await axios.get('/api/cars', { params })
    
    if (append) {
      // 追加数据（无限滚动）
      cars.value = [...cars.value, ...response.data.cars]
    } else {
      // 替换数据（初始加载或筛选）
      cars.value = response.data.cars
    }
    
    total.value = response.data.total
    hasMore.value = response.data.has_more
    currentPage.value = response.data.page
    
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多数据
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) {
    return
  }
  
  await fetchCars(currentPage.value + 1, true)
}

// 滚动监听
const handleScroll = () => {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 距离底部100px时开始加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMore()
  }
}

// 监听区域变化
watch(selectedRegion, () => {
  // 重置分页状态
  currentPage.value = 1
  hasMore.value = true
  
  // 重新获取数据
  fetchCars()
})

const handleCarClick = (car) => {
  selectedCar.value = car
  showModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  selectedCar.value = null
}

onMounted(() => {
  // 检查会话状态
  const hasAccess = sessionStorage.getItem('homepage_access')
  const accessTime = sessionStorage.getItem('homepage_access_time')
  console.log('HomeView 加载, 会话状态:', { hasAccess, accessTime })
  
  // 初始加载数据
  fetchCars()
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">车辆图片浏览</h2>
      <p class="text-gray-600">选择区域查看对应车辆信息</p>
      
      <!-- 统计信息 -->
      <div v-if="!loading" class="mt-4 text-sm text-gray-500">
        共 {{ total }} 辆车辆
        <span v-if="selectedRegion && selectedRegion !== '全部'">
          （{{ selectedRegion }}地区）
        </span>
        <span v-if="hasMore" class="ml-2">
          · 滚动加载更多
        </span>
      </div>
    </div>

    <!-- 区域选择器 -->
    <RegionSelector
      :regions="regions"
      :selected="selectedRegion"
      @update:selected="selectedRegion = $event"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- 车辆网格 -->
    <CarGrid
      v-else
      :cars="filteredCars"
      @car-click="handleCarClick"
    />

    <!-- 加载更多指示器 -->
    <div v-if="!loading && cars.length > 0" class="text-center py-8">
      <div v-if="loadingMore" class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span class="text-gray-600">加载更多...</span>
      </div>
      
      <div v-else-if="!hasMore" class="text-gray-500">
        <div class="border-t border-gray-200 pt-4">
          已显示全部 {{ cars.length }} 辆车辆
        </div>
      </div>
      
      <button 
        v-else
        @click="loadMore"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        点击加载更多
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && cars.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-4xl mb-4">🚗</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">暂无车辆数据</h3>
      <p class="text-gray-500">
        <span v-if="selectedRegion && selectedRegion !== '全部'">
          {{ selectedRegion }}地区暂无车辆信息
        </span>
        <span v-else>
          还没有添加任何车辆
        </span>
      </p>
    </div>

    <!-- 车辆详情模态框 -->
    <CarModal
      v-if="showModal"
      :car="selectedCar"
      @close="handleCloseModal"
    />
  </div>
</template> 