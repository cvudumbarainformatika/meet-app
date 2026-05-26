<template>
  <Teleport to="body">
    <div
      class="fixed z-[1000] flex gap-2.5 pointer-events-none max-w-md w-full"
      :class="positionClass"
    >
      <TransitionGroup
        name="notification"
        tag="div"
        class="flex flex-col-reverse gap-2.5 w-full items-center sm:items-start"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="group pointer-events-auto relative flex w-full items-stretch gap-3.5 overflow-hidden rounded-2xl border bg-card/85 backdrop-blur-xl p-4 pr-10 shadow-xl shadow-black/10 border-border text-foreground transition-all duration-300 hover:shadow-black/15 hover:bg-card/90"
          :class="[
            notification.variant === 'destructive' && 'border-red-500/25 bg-red-950/10 text-red-200 dark:border-red-500/15',
            notification.variant === 'success' && 'border-emerald-500/25 bg-emerald-950/10 text-emerald-200 dark:border-emerald-500/15',
            notification.variant === 'warning' && 'border-amber-500/25 bg-amber-950/10 text-amber-200 dark:border-amber-500/15',
            notification.variant === 'info' && 'border-blue-500/25 bg-blue-950/10 text-blue-200 dark:border-blue-500/15',
          ]"
          role="alert"
        >
          <!-- Left Accent Stripe / Indicator -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1.5"
            :class="[
              notification.variant === 'destructive' && 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
              notification.variant === 'success' && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
              notification.variant === 'warning' && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
              notification.variant === 'info' && 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
              notification.variant === 'default' && 'bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]',
            ]"
          ></div>

          <!-- Icon Wrapper -->
          <div class="flex items-start shrink-0 pt-0.5 ml-1">
            <div
              class="p-2 rounded-xl bg-background/50 border border-border/40 flex items-center justify-center shadow-inner"
              :class="[
                notification.variant === 'destructive' && 'text-red-400 border-red-500/10',
                notification.variant === 'success' && 'text-emerald-400 border-emerald-500/10',
                notification.variant === 'warning' && 'text-amber-400 border-amber-500/10',
                notification.variant === 'info' && 'text-blue-400 border-blue-500/10',
                notification.variant === 'default' && 'text-primary border-primary/10',
              ]"
            >
              <!-- Lucide Icons -->
              <AlertCircle v-if="notification.variant === 'destructive'" class="h-4.5 w-4.5" />
              <CheckCircle v-else-if="notification.variant === 'success'" class="h-4.5 w-4.5" />
              <AlertTriangle v-else-if="notification.variant === 'warning'" class="h-4.5 w-4.5" />
              <Info v-else-if="notification.variant === 'info'" class="h-4.5 w-4.5" />
              <Bell v-else class="h-4.5 w-4.5" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <div class="font-bold text-sm leading-tight text-foreground/95 tracking-tight">
              {{ notification.title }}
            </div>
            <p v-if="notification.description" class="mt-1 text-xs text-muted-foreground leading-relaxed font-medium">
              {{ notification.description }}
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="removeNotification(notification.id)"
            class="absolute top-3.5 right-3 p-1 rounded-lg bg-transparent hover:bg-foreground/5 text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-all duration-200 cursor-pointer"
            :aria-label="`Tutup notifikasi ${notification.title}`"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
  X
} from 'lucide-vue-next'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const positionClass = computed(() => {
  // Mobile: bawah-tengah (bottom-center), Desktop: kiri-bawah (bottom-left)
  return 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 sm:left-6 sm:translate-x-0 sm:right-auto sm:top-auto px-4 sm:px-0'
})

const removeNotification = (id) => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.notification-leave-active {
  position: absolute;
  width: calc(100% - 2rem);
}
@media (min-width: 640px) {
  .notification-leave-active {
    width: 384px;
  }
}
.notification-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.95);
}
.notification-leave-to {
  opacity: 0;
  transform: scale(0.9);
  filter: blur(4px);
}
.notification-move {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>