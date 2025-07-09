<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'car-added'])

const form = ref({
  region: '',
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
         form.value.image && 
         !loading.value
})

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
    const formData = new FormData()
    formData.append('region', form.value.region)
    formData.append('contact', form.value.contact)
    formData.append('description', form.value.description)
    formData.append('image', form.value.image)
    
    const response = await axios.post('/api/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    emit('car-added', response.data)
    resetForm()
    
  } catch (err) {
    error.value = err.response?.data?.detail || '上传失败'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    region: '',
    contact: '',
    description: '',
    image: null
  }
  imagePreview.value = ''
  error.value = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <!-- 模态框背景 -->
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50" @click="handleClose">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">添加车辆</h3>
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

        <!-- 联系方式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
          <input
            v-model="form.contact"
            type="text"
            placeholder="手机号码或微信号"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
          <label class="block text-sm font-medium text-gray-700 mb-2">车辆图片 *</label>
          
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
              id="image-upload"
              required
            />
            <label for="image-upload" class="cursor-pointer">
              <div class="text-gray-400 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-600">
                <span class="text-blue-600 hover:text-blue-700">点击选择图片</span>
                或拖拽图片到此处
              </p>
              <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，最大 5MB</p>
            </label>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="!canSubmit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              上传中...
            </span>
            <span v-else>添加车辆</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 