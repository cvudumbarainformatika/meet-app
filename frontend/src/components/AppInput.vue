<template>
  <div class="space-y-1">
    <Label for="nameWisata">{{ label }}</Label>
    <!-- Input -->
    <Input
      :id="id"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      v-model="localValue"
      :class="[$attrs.class, { 'border-destructive': !!error }]"
    />

    <!-- Error text -->
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
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

// defineModel() untuk v-model otomatis
const modelValue = defineModel({
  type: [String, Number, null],
  default: null,
});



// local copy biar input tidak nge-lag
const localValue = computed({
  get() {
    // SELALU return STRING untuk input tampilan
    if (props.type === 'number') {
      return props.modelValue != null ? String(props.modelValue) : '';  // 5 → '5', 0 → '0', null → ''
    }
    return props.modelValue ?? '';
  },
  set(val) {  // val dari input: SELALU STRING
    // console.log('Set val (raw):', val, 'Type:', typeof val);  // Debug: '5', string
    
    if (props.type === 'number') {
      const trimmedVal = String(val ?? '').trim();  // Handle empty/whitespace
      
      if (!trimmedVal) {
        console.log('Emit null for empty');
        modelValue.value = null;  // Empty → null
        return;
      }
      
      const num = Number(trimmedVal);  // '5' → 5, '0' → 0, '1.5' → 1.5, 'abc' → NaN
      
      // console.log('Parsed num:', num, 'Type:', typeof num);  // Debug: 5, number
      
      if (isNaN(num)) {
        // console.log('Emit null for invalid');
        modelValue.value = null;  // Invalid → null
      } else {
        // console.log('Emit valid number:', num);
        modelValue.value = num;  // VALID: EMIT NUMBER!
      }
    } else {
      modelValue.value = val;  // Lainnya: string
    }
  },
});
</script>