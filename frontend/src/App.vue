<template>
  <router-view />
  <Notification />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import Notification from '@/components/ui/Notification.vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.fetchGlobalSettings()
})
</script>