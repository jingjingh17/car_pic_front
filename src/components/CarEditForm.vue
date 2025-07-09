<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'car-updated'])

const form = ref({
  region: '',
  password: '',
  contact: '',
  description: '',
  image: null
})

const loading = ref(false)
const error = ref('')
const imagePreview = ref('')

const regions = ['福田', '罗湖', '南山', '龙华', '龙岗', '宝安', '沙井', '广州']

const canSubmit = computed(() => {
  return form.value.region && 
         form.value.contact && 
         !loading.value
})

// 监听props变化，初始化表单
watch(() => props.car, (newCar) => {
  if (newCar) {
    form.value = {
      region: newCar.region || '',
      password: '', // 密码不显示，只有当用户输入时才更新
      contact: newCar.contact || '',
      description: newCar.description || '',
      image: null
    }
    // 显示当前图片（BASE64格式）
    imagePreview.value = newCar.image_base64 || ''
  }
}, { immediate: true })

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const submitForm = async () => {
  if (!canSubmit.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('admin_token')
    const formData = new FormData()
    
    formData.append('region', form.value.region)
    if (form.value.password) {
      formData.append('password', form.value.password)
    }
    formData.append('contact', form.value.contact)
    formData.append('description', form.value.description)
    if (form.value.image) {
      formData.append('image', form.value.image)
    }
    
    const response = await axios.put(`/api/cars/${props.car.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    
    emit('car-updated', response.data)
    
  } catch (err) {
    error.value = err.response?.data?.detail || '更新失败'
    if (err.response?.status === 401) {
      alert('认证失败，请重新登录')
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    region: '',
    password: '',
    contact: '',
    description: '',
    image: null
  }
  imagePreview.value = ''
  error.value = ''
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <!-- 模态框背景 -->
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50" @click="handleClose">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">编辑车辆 #{{ car.id }}</h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="submitForm" class="p-6 space-y-6">
        <!-- 区域选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">所属区域 *</label>
          <select
            v-model="form.region"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          >
            <option value="">请选择区域</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>

        <!-- 密码设置 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">访问密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="留空表示不修改密码"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p class="text-sm text-gray-500 mt-1">留空表示不修改当前密码</p>
        </div>

        <!-- 联系方式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">联系方式 *</label>
          <input
            v-model="form.contact"
            type="text"
            placeholder="手机号码或微信号"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <!-- 车辆描述 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">车辆描述</label>
          <textarea
            v-model="form.description"
            placeholder="车型、年份、价格等信息"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          ></textarea>
        </div>

        <!-- 图片上传 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">车辆图片</label>
          
          <!-- 图片预览 -->
          <div v-if="imagePreview" class="mb-4">
            <img
              :src="imagePreview"
              alt="图片预览"
              class="w-full max-w-md mx-auto rounded-lg shadow-sm"
            />
          </div>
          
          <!-- 文件选择 -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="hidden"
              id="image-upload-edit"
            />
            <label for="image-upload-edit" class="cursor-pointer">
              <div class="text-gray-400 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-600">
                <span class="text-blue-600 hover:text-blue-700">点击选择新图片</span>
                或拖拽图片到此处
              </p>
              <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，最大 5MB（留空表示不修改图片）</p>
            </label>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>

        <!-- 按钮组 -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="!canSubmit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 