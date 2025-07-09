<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import CarUploadForm from '../components/CarUploadForm.vue'
import CarEditForm from '../components/CarEditForm.vue'
import AdminCarList from '../components/AdminCarList.vue'
import HomepagePasswordSettings from '../components/HomepagePasswordSettings.vue'

const router = useRouter()
const cars = ref([])
const loading = ref(false)
const showUploadForm = ref(false)
const showEditForm = ref(false)
const showPasswordSettings = ref(false)
const editingCar = ref(null)

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

const handleCarAdded = (newCar) => {
  cars.value.unshift(newCar)
  showUploadForm.value = false
}

const handleCarDeleted = (carId) => {
  cars.value = cars.value.filter(car => car.id !== carId)
}

const handleEditCar = (car) => {
  editingCar.value = car
  showEditForm.value = true
}

const handleCarUpdated = (updatedCar) => {
  const index = cars.value.findIndex(car => car.id === updatedCar.id)
  if (index !== -1) {
    cars.value[index] = updatedCar
  }
  showEditForm.value = false
  editingCar.value = null
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

onMounted(() => {
  fetchCars()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 标题和操作 -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">管理后台</h2>
        <p class="text-gray-600 mt-1">管理车辆图片和信息</p>
      </div>
      <div class="flex space-x-4">
        <button
          @click="showPasswordSettings = true"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          首页密码
        </button>
        <button
          @click="showUploadForm = true"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          添加车辆
        </button>
        <button
          @click="handleLogout"
          class="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          退出登录
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总车辆数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ cars.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">覆盖区域</p>
            <p class="text-2xl font-semibold text-gray-900">{{ new Set(cars.map(car => car.region)).size }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">今日新增</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ cars.filter(car => new Date(car.created_at).toDateString() === new Date().toDateString()).length }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">系统状态</p>
            <p class="text-2xl font-semibold text-green-600">正常</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 车辆列表 -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <AdminCarList
      v-else
      :cars="cars"
      @car-deleted="handleCarDeleted"
      @car-updated="handleEditCar"
    />

    <!-- 首页密码设置模态框 -->
    <HomepagePasswordSettings
      v-if="showPasswordSettings"
      @close="showPasswordSettings = false"
    />

    <!-- 上传表单模态框 -->
    <CarUploadForm
      v-if="showUploadForm"
      @close="showUploadForm = false"
      @car-added="handleCarAdded"
    />

    <!-- 编辑表单模态框 -->
    <CarEditForm
      v-if="showEditForm && editingCar"
      :car="editingCar"
      @close="showEditForm = false; editingCar = null"
      @car-updated="handleCarUpdated"
    />
  </div>
</template> 