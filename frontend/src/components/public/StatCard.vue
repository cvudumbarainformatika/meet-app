<template>
  <div 
    ref="cardRef"
    class="relative group rounded-3xl p-[1px] overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 cursor-default"
  >
    <!-- Always visible subtle animated gradient border -->
    <div 
      class="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
      :class="borderGradientClass"
    ></div>
    
    <!-- Inner Card with subtle tint -->
    <div class="relative h-full rounded-[23px] p-6 sm:p-8 flex flex-col items-center text-center border-0 overflow-hidden" :class="bgTintClass">
      
      <!-- Abstract Background Element inside Card -->
      <div class="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-40" :class="bgIconClass"></div>

      <!-- Icon Container -->
      <div class="relative w-16 h-16 rounded-2xl mb-6 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
        <div class="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300" :class="bgIconClass"></div>
        <component :is="icon" class="w-8 h-8 relative z-10 transition-transform duration-500 group-hover:scale-110" :class="textIconClass" />
      </div>

      <!-- Stat Value (Animated Counter) -->
      <h3 class="text-4xl sm:text-5xl font-black mb-2 tracking-tight transition-colors duration-300 group-hover:text-foreground" :class="textValueClass">
        <span v-if="prefix" class="text-2xl">{{ prefix }}</span>
        {{ displayValue.toLocaleString('id-ID') }}
        <span v-if="suffix" class="text-2xl">{{ suffix }}</span>
      </h3>
      
      <!-- Stat Label -->
      <p class="text-sm sm:text-base font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{{ label }}</p>

      <!-- Decorative Line (Always slightly visible, expands on hover) -->
      <div 
        class="h-1 rounded-full mt-6 transition-all duration-500 w-8 opacity-50 group-hover:w-16 group-hover:opacity-100"
        :class="lineGradientClass"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps({
  icon: {
    type: [Object, Function],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 2000 // ms
  },
  colorScheme: {
    type: String,
    default: 'primary' // 'primary', 'blue', 'green', 'amber', 'purple'
  }
})

// Dynamic Styling Computations
const borderGradientClass = computed(() => {
  const map = {
    primary: 'bg-gradient-to-br from-primary/60 via-primary/10 to-primary/60',
    blue: 'bg-gradient-to-br from-blue-500/60 via-blue-500/10 to-cyan-500/60',
    green: 'bg-gradient-to-br from-green-500/60 via-green-500/10 to-emerald-500/60',
    amber: 'bg-gradient-to-br from-amber-500/60 via-amber-500/10 to-orange-500/60',
    purple: 'bg-gradient-to-br from-purple-500/60 via-purple-500/10 to-fuchsia-500/60',
  }
  return map[props.colorScheme] || map['primary']
})

const bgTintClass = computed(() => {
  const map = {
    primary: 'bg-card/95 dark:bg-card/90 backdrop-blur-md',
    blue: 'bg-blue-50/90 dark:bg-blue-950/20 backdrop-blur-md',
    green: 'bg-green-50/90 dark:bg-green-950/20 backdrop-blur-md',
    amber: 'bg-amber-50/90 dark:bg-amber-950/20 backdrop-blur-md',
    purple: 'bg-purple-50/90 dark:bg-purple-950/20 backdrop-blur-md',
  }
  // Default to standard card background if not matched
  return map[props.colorScheme] || 'bg-card/95 dark:bg-card/90 backdrop-blur-md'
})

const textValueClass = computed(() => {
  // Numbers have slight tint to match theme
  const map = {
    primary: 'text-primary dark:text-primary',
    blue: 'text-blue-700 dark:text-blue-400',
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
    purple: 'text-purple-700 dark:text-purple-400',
  }
  return map[props.colorScheme] || 'text-foreground'
})

const bgIconClass = computed(() => {
  const map = {
    primary: 'bg-primary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  }
  return map[props.colorScheme] || map['primary']
})

const textIconClass = computed(() => {
  const map = {
    primary: 'text-primary',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }
  return map[props.colorScheme] || map['primary']
})

const lineGradientClass = computed(() => {
  const map = {
    primary: 'bg-gradient-to-r from-primary to-transparent',
    blue: 'bg-gradient-to-r from-blue-500 to-transparent',
    green: 'bg-gradient-to-r from-green-500 to-transparent',
    amber: 'bg-gradient-to-r from-amber-500 to-transparent',
    purple: 'bg-gradient-to-r from-purple-500 to-transparent',
  }
  return map[props.colorScheme] || map['primary']
})

const cardRef = ref(null)
const displayValue = ref(0)
const hasAnimated = ref(false)

const animateValue = (start, end, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    displayValue.value = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      displayValue.value = end;
    }
  };
  window.requestAnimationFrame(step);
}

useIntersectionObserver(
  cardRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !hasAnimated.value) {
      animateValue(0, props.value, props.duration)
      hasAnimated.value = true
    }
  },
  { threshold: 0.1 }
)

watch(() => props.value, (newVal) => {
  if (hasAnimated.value) {
    animateValue(displayValue.value, newVal, props.duration / 2)
  }
})
</script>
