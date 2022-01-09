import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host:"0.0.0.0",
    port:3000,
    proxy: {
      // 字符串简写写法
      '/v1': 'http://127.0.0.1:8080/',
    }
  },
})
