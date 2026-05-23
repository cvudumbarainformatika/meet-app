<template>
  <!-- Removed overflow-hidden so the waves can overlap the next section seamlessly -->
  <div class="relative w-full min-h-[90vh] flex items-center justify-center bg-transparent pt-20 pb-16">
    <!-- Premium Background Effects with Abstract Curves -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <!-- Glow Gradients -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse-slow" style="animation-delay: 2s;"></div>
      
      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTI4LCAxMjgsIDEyOCwgMC4xKSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20 mask-image-radial"></div>
    </div>

    <!-- Animated Abstract Wave Curves (Bleeding down into next section, fully faded at the bottom) -->
    <div class="absolute bottom-[-150px] left-0 w-full h-[400px] sm:h-[450px] pointer-events-none z-0" style="mask-image: linear-gradient(to bottom, black 20%, transparent 90%); -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 90%);">
      <svg class="absolute bottom-0 left-0 w-[200%] md:w-[150%] h-full animate-wave-slow opacity-80" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" class="text-primary/20" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      <svg class="absolute bottom-0 left-0 w-[200%] md:w-[150%] h-full animate-wave-medium opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" class="text-blue-500/20" d="M0,128L48,138.7C96,149,192,171,288,186.7C384,203,480,213,576,197.3C672,181,768,139,864,128C960,117,1056,139,1152,165.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      <svg class="absolute bottom-0 left-0 w-[200%] md:w-[150%] h-full animate-wave-fast opacity-90" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" class="text-primary/30 dark:text-primary/25" d="M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,240C672,213,768,171,864,170.7C960,171,1056,213,1152,213.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>

    <!-- Main Content -->
    <div class="container relative z-10 px-4 md:px-6 mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
      
      <!-- Text Area -->
      <div class="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start max-w-3xl mx-auto lg:mx-0">
        
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 animate-fade-in-up" style="animation-delay: 0.1s;">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span class="text-sm font-semibold">{{ badgeText }}</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground animate-fade-in-up" style="animation-delay: 0.2s;" v-html="formattedHeadline">
        </h1>

        <!-- Subheadline -->
        <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed animate-fade-in-up" style="animation-delay: 0.3s;">
          {{ subheadline }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style="animation-delay: 0.4s;">
          <Button size="lg" class="rounded-full px-8 text-md h-14 shadow-lg hover:shadow-primary/25 transition-all duration-300 group" @click="scrollToCekStatus">
            {{ primaryCtaText }}
            <ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" class="rounded-full px-8 text-md h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border hover:bg-accent transition-all duration-300 group" @click="handleSecondaryCta">
            {{ secondaryCtaText }}
            <ArrowRight class="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
        </div>

        <!-- Mini Stats -->
        <div class="mt-12 flex items-center justify-center lg:justify-start gap-8 animate-fade-in-up" style="animation-delay: 0.5s;">
          <div class="flex flex-col" v-for="(stat, index) in miniStats" :key="index">
            <span class="text-3xl font-bold text-foreground">{{ stat.value }}</span>
            <span class="text-sm text-muted-foreground font-medium">{{ stat.label }}</span>
          </div>
        </div>

      </div>

      <!-- Hero Visuals/Images -->
      <div class="flex-1 relative w-full max-w-lg lg:max-w-none flex justify-center animate-fade-in-up" style="animation-delay: 0.3s;">
        <!-- Premium Floating Image Layout -->
        <div class="relative w-full aspect-square max-w-[500px]">
          <!-- Main Hero Image Area (Supports Image URL or Icon fallback) -->
          <div class="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/80 to-blue-600/80 p-1 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 ease-out">
            <div class="w-full h-full rounded-[1.8rem] bg-card overflow-hidden relative flex items-center justify-center">
              <img v-if="heroImage" :src="heroImage" alt="Hero Image" class="w-full h-full object-cover absolute inset-0 opacity-80" />
              <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10"></div>
              
              <!-- Elegant Vector House Illustration -->
              <svg v-if="!heroImage" class="w-56 h-56 relative z-10 animate-float" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Base glow -->
                <ellipse cx="100" cy="160" rx="70" ry="25" fill="currentColor" class="text-primary/20 blur-xl" />
                
                <!-- Floating Platform -->
                <path d="M100 160 L170 125 L100 90 L30 125 Z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" class="text-primary/10 stroke-primary/20" />
                <path d="M30 125 L100 160 L100 175 L30 140 Z" fill="currentColor" class="text-primary/20" />
                <path d="M170 125 L100 160 L100 175 L170 140 Z" fill="currentColor" class="text-primary/30" />

                <!-- Left Wall -->
                <path d="M45 117.5 L100 145 L100 70 L45 42.5 Z" fill="currentColor" class="text-slate-200 dark:text-slate-800" />
                
                <!-- Right Wall -->
                <path d="M155 117.5 L100 145 L100 70 L155 42.5 Z" fill="currentColor" class="text-slate-100 dark:text-slate-700" />

                <!-- Left Roof -->
                <path d="M35 50 L100 82.5 L100 12.5 L35 -20 Z" fill="currentColor" class="text-primary/90" />
                <!-- Right Roof -->
                <path d="M165 50 L100 82.5 L100 12.5 L165 -20 Z" fill="currentColor" class="text-primary" />
                <!-- Roof Edge Highlight -->
                <path d="M35 50 L100 82.5 L165 50" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-30" />

                <!-- Main Door -->
                <path d="M140 110 L115 122.5 L115 85 L140 72.5 Z" fill="currentColor" class="text-blue-500/80" />
                <!-- Door Handle -->
                <circle cx="120" cy="105" r="1.5" fill="white" />
                
                <!-- Large Modern Window -->
                <path d="M55 95 L85 110 L85 70 L55 55 Z" fill="currentColor" class="text-blue-300/40 dark:text-blue-400/20" />
                <!-- Window Frame -->
                <path d="M55 95 L85 110 L85 70 L55 55 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600" />
                <!-- Window Grid -->
                <path d="M70 62.5 L70 102.5" stroke="currentColor" stroke-width="1" class="text-slate-300 dark:text-slate-600" />
                <path d="M55 75 L85 90" stroke="currentColor" stroke-width="1" class="text-slate-300 dark:text-slate-600" />

                <!-- Decoration Plants -->
                <circle cx="155" cy="120" r="8" fill="#10B981" />
                <circle cx="145" cy="125" r="6" fill="#34D399" />
                <path d="M155 125 L155 135" stroke="#047857" stroke-width="2" stroke-linecap="round" />
                
                <!-- Floating Elements around house -->
                <circle cx="40" cy="20" r="3" fill="currentColor" class="text-primary/60 animate-ping" />
                <circle cx="160" cy="0" r="4" fill="currentColor" class="text-blue-400/60" />
                <rect x="20" y="80" width="4" height="4" transform="rotate(45 20 80)" fill="currentColor" class="text-amber-400/80" />
              </svg>
              
              <!-- Glass Card overlay -->
              <div 
                @click="router.push('/syarat-ketentuan')"
                class="absolute bottom-4 left-4 right-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl z-20 flex flex-col gap-3 min-h-[140px] transition-all duration-500 cursor-pointer hover:bg-white/90 dark:hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] group/card"
              >
                <div class="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <div class="p-2 bg-primary/20 rounded-lg shrink-0 group-hover/card:bg-primary group-hover/card:text-white transition-colors">
                    <Home class="w-5 h-5 text-primary group-hover/card:text-white transition-colors" />
                  </div>
                  <p class="text-xs md:text-sm font-black text-primary uppercase tracking-[0.2em]">CIRI-CIRI RTLH</p>
                </div>
                
                <div class="space-y-1.5 overflow-hidden">
                  <!-- Baris yang sudah selesai -->
                  <p v-for="(line, idx) in displayedLines" :key="idx" class="text-[11px] md:text-[13px] font-extrabold text-foreground leading-tight flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></span>
                    {{ line }}
                  </p>
                  
                  <!-- Baris yang sedang diketik -->
                  <p v-if="currentTypingLine" class="text-[11px] md:text-[13px] font-extrabold text-foreground leading-tight flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"></span>
                    {{ currentTypingLine }}<span class="inline-block w-1 h-3.5 bg-primary ml-0.5 animate-pulse"></span>
                  </p>
                </div>

                <!-- Tombol Navigasi (Visual Indicator) -->
                <div v-if="isFinished" class="mt-2 pt-2 border-t border-primary/5 animate-fade-in">
                  <div class="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-primary group-hover/card:translate-x-1 transition-transform">
                    PELAJARI SYARAT &amp; KETENTUAN 
                    <ArrowRight class="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Decorative Floating Element 1 -->
          <div class="absolute -top-6 -right-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xl animate-float">
            <TrendingUp class="w-8 h-8 text-green-500" />
          </div>

          <!-- Decorative Floating Element 2 -->
          <div class="absolute -bottom-10 -left-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xl animate-float" style="animation-delay: 1.5s;">
            <ShieldCheck class="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CheckCircle, TrendingUp, ShieldCheck, Home, Info } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps({
  badgeText: { type: String, default: 'Sistem Informasi e-RTLH Kota Probolinggo' },
  headline: { type: String, default: 'Wujudkan <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Rumah Layak</span> <br class="hidden md:block"/> Untuk Keluarga Sejahtera' },
  subheadline: { type: String, default: 'Program rehabilitasi Rumah Tidak Layak Huni (RTLH) sebagai wujud komitmen Pemerintah Kota Probolinggo dalam meningkatkan kualitas hidup masyarakat.' },
  primaryCtaText: { type: String, default: 'Cek Status Penerima' },
  secondaryCtaText: { type: String, default: 'Pelajari Program' },
  heroImage: { type: String, default: '' },
  floatingCardTitle: { type: String, default: 'Target Tercapai' },
  floatingCardSubtitle: { type: String, default: 'Rehabilitasi 2024' },
  miniStats: {
    type: Array,
    default: () => [
      { value: '100%', label: 'Transparan' },
      { value: 'Akurat', label: 'Berbasis Data Tepat Sasaran' }
    ]
  },
  criteria: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// --- SEQUENTIAL TYPING ANIMATION LOGIC ---
const criteriaList = computed(() => {
  if (props.criteria && props.criteria.length > 0) return props.criteria
  return [
    "1. DINDING BELUM PERMANEN / RUSAK",
    "2. ATAP SUDAH LAPUK / BOCOR",
    "3. LANTAI MASIH TANAH",
    "4. BELUM MEMILIKI MCK LAYAK"
  ]
})

const displayedLines = ref([])
const currentTypingLine = ref("")
const criteriaIndex = ref(0)
const charIndex = ref(0)
const isFinished = ref(false)
let typingTimer = null

const typeEffect = () => {
  if (criteriaIndex.value >= criteriaList.value.length) {
    // Selesai semua
    isFinished.value = true
    
    // Tunggu 8 detik lalu reset (loop) agar tetap dinamis
    typingTimer = setTimeout(() => {
      displayedLines.value = []
      currentTypingLine.value = ""
      criteriaIndex.value = 0
      charIndex.value = 0
      isFinished.value = false
      typeEffect()
    }, 8000)
    return
  }

  const fullText = criteriaList.value[criteriaIndex.value]
  
  if (charIndex.value < fullText.length) {
    currentTypingLine.value = fullText.substring(0, charIndex.value + 1)
    charIndex.value++
    typingTimer = setTimeout(typeEffect, 40)
  } else {
    // Baris ini selesai, pindahkan ke displayedLines
    displayedLines.value.push(currentTypingLine.value)
    currentTypingLine.value = ""
    charIndex.value = 0
    criteriaIndex.value++
    typingTimer = setTimeout(typeEffect, 400) // Jeda antar baris
  }
}

onMounted(() => {
  typeEffect()
})

onUnmounted(() => {
  clearTimeout(typingTimer)
})

// Allow HTML injection for gradient text in headline
const formattedHeadline = computed(() => props.headline)

const scrollToCekStatus = () => {
  const el = document.getElementById('cek-status-section')
  if (el) {
    const yOffset = -80 // Account for sticky header
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const handleSecondaryCta = () => {
  router.push('/login')
}
</script>

<style scoped>
.mask-image-radial {
  mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  opacity: 0;
  animation: fade-in-up 0.8s ease-out forwards;
}

/* Wave Animations */
@keyframes wave-x {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
}
.animate-wave-slow {
  animation: wave-x 20s ease-in-out infinite;
}
.animate-wave-medium {
  animation: wave-x 15s ease-in-out infinite reverse;
}
.animate-wave-fast {
  animation: wave-x 10s ease-in-out infinite;
}
</style>
