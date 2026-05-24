<template>
  <!-- ControlButton — Tombol kontrol di control bar (Discord Style) -->
  <button
    @click="$emit('toggle')"
    class="h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
    :class="buttonClass"
  >
    <component :is="active ? iconOn : iconOff" class="h-5 w-5" />
    
    <!-- Quasar Tooltip (Discord Style) -->
    <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
      {{ label }}
    </q-tooltip>
  </button>
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
    return 'bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30'
  }
  const colorMap = {
    default: 'bg-card hover:bg-card/80 text-foreground border border-border',
    blue: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30',
    red: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border border-destructive shadow-destructive/30',
  }
  return colorMap[props.color] ?? colorMap.default
})
</script>
