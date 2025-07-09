<script setup>
defineProps({
  regions: {
    type: Array,
    required: true
  },
  selected: {
    type: String,
    default: ''
  }
})

defineEmits(['update:selected'])
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">选择区域</h3>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
      <button
        v-for="region in regions"
        :key="region"
        @click="$emit('update:selected', region)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
          selected === region
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ region }}
      </button>
    </div>
  </div>
</template> 