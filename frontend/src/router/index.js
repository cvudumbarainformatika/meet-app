import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useSettingsStore } from '@/stores/settings'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    // Set dynamic document title berbasis appName database
    const settingsStore = useSettingsStore()
    const appName = settingsStore.appName || 'MeetApp'
    
    if (to.meta && to.meta.title) {
      document.title = `${to.meta.title} — ${appName}`
    } else {
      document.title = appName
    }

    // Gunakan meetapp_user karena kita sudah mengubah key di stores/auth.js
    const user = JSON.parse(localStorage.getItem('meetapp_user'))

    // Route yang butuh login
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!user) {
        // Belum login → ke halaman public (lobby)
        next('/')
      } else {
        next()
      }
    }
    // Route khusus tamu (login / register page)
    else if (to.matched.some(record => record.meta.guest)) {
      if (user) {
        // Sudah login → jangan biarkan masuk login, lempar ke lobby
        next('/')
      } else {
        next()
      }
    }
    // Route publik lainnya
    else {
      next()
    }
  })

  return Router
})