<template>
  <!-- 
    MeetLayout: Layout utama untuk aplikasi MeetApp.
    Menggunakan CSS variables (bg-background, text-foreground) agar mendukung theming global.
  -->
  <div class="min-h-screen w-full bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
    <router-view />
  </div>
</template>

<script setup>
// Layout yang minimalis, hanya sebagai wrapper utama agar modular.
// Jika nanti ada navbar global (di luar meeting room), bisa ditaruh di sini.
</script>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
