<template>
  <!-- ControlButton — Tombol kontrol di control bar -->
  <div class="flex flex-col items-center gap-1">
    <button
      @click="$emit('toggle')"
      class="h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg"
      :class="buttonClass"
      :title="label"
    >
      <component :is="active ? iconOn : iconOff" class="h-5 w-5" />
    </button>
    <span class="text-muted-foreground text-[10px] font-medium hidden sm:block">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: true },
  iconOn: { type: [Object, Function], required: true },
  iconOff: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'default' }, // 'default' | 'blue' | 'red'
})

defineEmits(['toggle'])

const buttonClass = computed(() => {
  if (!props.active) {
    return 'bg-destructive/20 hover:bg-destructive/30 text-destructive ring-1 ring-destructive/30'
  }
  const colorMap = {
    default: 'bg-card hover:bg-card/80 text-foreground',
    blue: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/30',
    red: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/30',
  }
  return colorMap[props.color] ?? colorMap.default
})
</script>
