import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 配置axios
axios.defaults.baseURL = 'https://carpicback-production.up.railway.app'
axios.defaults.headers.common['Content-Type'] = 'application/json'

const app = createApp(App)

// 全局注册axios
app.config.globalProperties.$http = axios

app.use(router)

app.mount('#app')
