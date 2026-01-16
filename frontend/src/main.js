import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from '@/App.vue'
import router from '@/router'
import { resources, defaultNS } from '@/locales/resources'
import '@/index.css'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: navigator.language?.split('-')[0] || 'en',
  fallbackLocale: 'en',
  messages: Object.keys(resources).reduce((acc, lang) => {
    acc[lang] = resources[lang][defaultNS]
    return acc
  }, {})
})

// Create Pinia store
const pinia = createPinia()

// Toast options
const toastOptions = {
  position: 'bottom-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Create and mount app
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Toast, toastOptions)

app.mount('#root')
