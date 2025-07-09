<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import RegionSelector from '../components/RegionSelector.vue'
import CarGrid from '../components/CarGrid.vue'
import CarModal from '../components/CarModal.vue'

const selectedRegion = ref('')
const cars = ref([])
const loading = ref(false)
const showModal = ref(false)
const selectedCar = ref(null)

const regions = [
  '全部', '福田', '罗湖', '南山', '龙华', '龙岗', '宝安', '沙井', '广州'
]

const filteredCars = computed(() => {
  if (!selectedRegion.value || selectedRegion.value === '全部') {
    return cars.value
  }
  return cars.value.filter(car => car.region === selectedRegion.value)
})

const fetchCars = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/cars')
    cars.value = response.data.cars
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  } finally {
    loading.value = false
  }
}

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
  
  fetchCars()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">车辆图片浏览</h2>
      <p class="text-gray-600">选择区域查看对应车辆信息</p>
    </div>

    <!-- 区域选择器 -->
    <RegionSelector
      :regions="regions"
      :selected="selectedRegion"
      @update:selected="selectedRegion = $event"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 车辆网格 -->
    <CarGrid
      v-else
      :cars="filteredCars"
      @car-click="handleCarClick"
    />

    <!-- 车辆详情模态框 -->
    <CarModal
      v-if="showModal"
      :car="selectedCar"
      @close="handleCloseModal"
    />
  </div>
</template> 