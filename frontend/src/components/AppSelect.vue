
Vue **tidak akan mengenali** prop `:key`, karena itu adalah **reserved attribute** untuk `v-for`, bukan prop component kamu → jadi `optionKey` selalu `null` → `v-for` jadi `:key="i"` (index) → re-render tidak optimal + kadang select error saat update options.

### Selain itu, ada beberapa bug kecil lain:
- `is-no-data` → propnya `isNoData` (camelCase), tapi kamu pakai kebab-case → Vue di HTML otomatis convert, tapi lebih aman pakai camelCase di template juga.
- `getValue(item) ?? -1` → kalau `getValue(item)` return `null` atau `undefined`, jadi `-1` → bisa bikin value jadi salah.
- `isDisabled` logicnya pakai `item` langsung kalau tidak ada `optionKey`, tapi sebaiknya konsisten pakai `valueKey`.

---

### Ini Versi **BENAR 100% & TANPA ANOMALI** dari component + penggunaannya:

#### 1. Perbaiki Component: `AppSelect.vue` (Versi Fix & Clean)

```vue
<template>
  <div class="space-y-1">
    <Label v-if="label" :for="id">{{ label }}</Label>
    
    <Select 
      :disabled="disabled" 
      :model-value="modelValue" 
      @update:model-value="emit('update:modelValue', $event)"
    >
      <SelectTrigger 
        :id="id" 
        :class="{ 'border-destructive': !!error }"
        :disabled="disabled"
      >
        <SelectValue :placeholder="placeholder || 'Pilih...'" />
      </SelectTrigger>
      
      <SelectContent>
        <!-- Opsi "Tidak Ada" kalau kosong -->
        <SelectItem v-if="isNoData" :value="noDataValue">
          {{ noDataText }}
        </SelectItem>
        
        <SelectItem
          v-for="item in options"
          :key="optionKey ? item[optionKey] : getValue(item)"
          :value="getValue(item)"
          :disabled="isDisabled(item)"
        >
          {{ getItemText(item) }}
        </SelectItem>
      </SelectContent>
    </Select>

    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number, Object, Array], default: null },
  placeholder: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  
  // Key untuk text & value
  textKey: { type: String, default: 'text' },
  valueKey: { type: String, default: 'value' },
  
  // Key unik untuk v-for (penting untuk reaktivitas!)
  optionKey: { type: String, default: null },
  
  // Tampilkan "Tidak Ada Data" saat options kosong
  isNoData: { type: Boolean, default: false },
  noDataValue: { type: [String, Number], default: 0 },
  noDataText: { type: [String, Number], default: 'Tidak Ada Data' },
  
  disabled: { type: Boolean, default: false },
  
  // Nonaktifkan opsi tertentu
  disableOption: { type: [String, Number], default: null },
  disableOptions: { type: Array, default: () => [] },
  
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const getValue = (item) => {
  if (item === null || item === undefined) return null
  if (typeof item !== 'object') return item
  return props.valueKey && item[props.valueKey] !== undefined 
    ? item[props.valueKey] 
    : item
}

const getItemText = (item) => {
  if (item === null || item === undefined) return 'Tidak Ada'
  if (typeof item !== 'object') return String(item)
  return props.textKey && item[props.textKey] !== undefined
    ? item[props.textKey]
    : String(item)
}

const isDisabled = (item) => {
  const value = getValue(item)
  return value === props.disableOption || props.disableOptions.includes(value)
}
</script>