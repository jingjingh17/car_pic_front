<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">车辆图片管理系统</h1>
          <nav class="flex space-x-6">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600 bg-blue-50"
            >
              首页
            </router-link>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* TailwindCSS已配置，无需额外样式 */
</style>