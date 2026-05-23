<template>
  <div class="space-y-1">
    <Label for="nameWisata">{{ label }}</Label>
    <!-- Input -->
    <Textarea
      :id="id"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      v-model="localValue"
      @input="emit('update:modelValue', $event.target.value)"
      :class="[$attrs.class, { 'border-destructive': !!error }]"
    />

    <!-- Error text -->
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },

  // error message, optional
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// local copy biar input tidak nge-lag
const localValue = computed({
  get() {
    return props.modelValue ?? ''   // aman dari undefined
  },
  set(val) {
    emit('update:modelValue', val)
  },
})
</script>