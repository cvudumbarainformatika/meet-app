<template>
  <div class="text-center max-w-2xl mx-auto animate-fade-in-up mt-10">
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      Platform Meeting Open-Source
    </div>
    
    <h1 class="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary-foreground to-primary mb-6 leading-tight">
      Komunikasi Tanpa Batas Ruang
    </h1>
    
    <p class="text-muted-foreground text-lg sm:text-xl mb-10 leading-relaxed">
      Bergabunglah dengan pengalaman meeting yang cepat, aman, dan privasi penuh. Buat room Anda sendiri atau bergabung ke meeting yang sudah ada.
    </p>
    
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <RouterLink
        :to="{ path: '/login', query: $route.query }"
        class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
      >
        Mulai Sekarang
        <ArrowRight class="h-5 w-5" />
      </RouterLink>
      <RouterLink
        :to="{ path: '/register', query: $route.query }"
        class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-semibold text-lg border border-border transition-all flex items-center justify-center hover:-translate-y-0.5"
      >
        Buat Akun Gratis
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from 'lucide-vue-next'
</script>
