import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
// https://qiita.com/tat_mae084/items/4051c61926dc8165e80b
export default defineConfig({
  base: process.env.GITHUB_PAGES
    ? "reactjs-ble-console"
    : "./",
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['vite.svg'],
    injectRegister: 'auto',
    manifest: {
      name: 'BLE Console',
      short_name: 'BLE Console',
      description: 'BLE Interface with ReactJS and Bluetooth WEB API',
      theme_color: '#2f2f2f',
      icons: [
        {
          src: 'vite.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
      ]
    }
  })
  ],
})