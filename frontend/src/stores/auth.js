// =============================================================
// frontend/src/stores/auth.js
// Auth store untuk MeetApp — JWT based
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const user = ref(JSON.parse(localStorage.getItem('meetapp_user') || 'null'))
  const accessToken = ref(localStorage.getItem('meetapp_token') || '')

  // --- Computed ---
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  // Alias untuk kompatibilitas kode lama
  const isAuthenticated = isLoggedIn

  // --- Actions ---
  function setAuth(userData, token) {
    user.value = userData
    accessToken.value = token
    localStorage.setItem('meetapp_user', JSON.stringify(userData))
    localStorage.setItem('meetapp_token', token)
  }

  function logout() {
    user.value = null
    accessToken.value = ''
    localStorage.removeItem('meetapp_user')
    localStorage.removeItem('meetapp_token')
  }

  return {
    // State
    user,
    accessToken,
    // Computed
    isLoggedIn,
    isAuthenticated,
    // Actions
    setAuth,
    logout,
  }
}, {
  // Tidak perlu persist plugin karena kita handle manual via localStorage
})