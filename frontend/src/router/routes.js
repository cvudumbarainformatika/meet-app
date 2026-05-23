// =============================================================
// frontend/src/router/routes.js
// Route definitions untuk MeetApp
// =============================================================

const routes = [
  // ── Public routes (tanpa auth) ──
  {
    path: '/',
    component: () => import('@/pages/meet/LobbyPage.vue'),
    meta: { title: 'MeetApp — Lobby' },
  },
  {
    path: '/login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { title: 'Login — MeetApp', guest: true },
  },
  {
    path: '/register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { title: 'Daftar — MeetApp', guest: true },
  },

  // ── Room (protected) ──
  {
    path: '/room/:slug',
    component: () => import('@/pages/meet/RoomPage.vue'),
    meta: { title: 'Meeting Room — MeetApp', requiresAuth: true },
  },

  // ── 404 ──
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/meet/LobbyPage.vue'),
  },
]

export default routes