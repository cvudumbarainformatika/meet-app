<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  SlidersHorizontal,
  Plus
} from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const props = defineProps({
  title: String,
  description: String,
  items: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] }, // { key: 'name', label: 'Name', align: 'left/right', sortable: bool }
  loading: Boolean,
  pageSize: { type: Number, default: 10 },
  searchPlaceholder: { type: String, default: 'Cari data...' },
  showAddButton: { type: Boolean, default: true },
  addButtonLabel: { type: String, default: 'Tambah Data' },
  // --- Server Side Props ---
  serverSide: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 }
})

const emit = defineEmits(['add', 'rowClick', 'change'])

// --- State ---
const searchQuery = ref('')
const currentPage = ref(1)

// --- Filtering Logic ---
// We allow parent to inject filter logic via slot or use internal search
const filteredItems = computed(() => {
  // If server side, we don't filter internally
  if (props.serverSide) return props.items || []

  let result = props.items || []
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(q)
      )
    })
  }
  
  return result
})

// --- Pagination Logic ---
const totalDataCount = computed(() => props.serverSide ? props.totalItems : filteredItems.value.length)
const totalPages = computed(() => Math.ceil(totalDataCount.value / props.pageSize) || 1)

const paginatedItems = computed(() => {
  // If server side, items is already paginated from backend
  if (props.serverSide) return props.items || []

  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredItems.value.slice(start, end)
})

// --- Smart Pagination Range ---
const displayedPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  const range = 1 // Halaman di sekitar current

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
      if (pages.length > 0 && i - pages[pages.length - 1] > 1) {
        pages.push('...')
      }
      pages.push(i)
    }
  }
  return pages
})

// --- Server Side Emitter & Watchers ---
let debounceTimer = null
watch([currentPage, searchQuery], ([newPage, newSearch], [oldPage, oldSearch]) => {
  // If it's internal client side, just reset page on search
  if (!props.serverSide) {
    if (newSearch !== oldSearch) currentPage.value = 1
    return
  }

  // If server side, we emit changes
  if (newSearch !== oldSearch) {
    currentPage.value = 1
    // Debounce search to not spam server
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        emit('change', { page: 1, search: newSearch })
    }, 500)
  } else {
    emit('change', { page: newPage, search: newSearch })
  }
})

const handleRowClick = (item) => {
  emit('rowClick', item)
}
</script>

<template>
  <div class="data-table-premium-container space-y-4">
    <!-- Top Bar: Search & Custom Filters -->
    <Card class="border-none bg-card shadow-sm ring-1 ring-border overflow-hidden hidden md:block">
      <CardContent class="p-4 sm:p-6">
          <!-- Pencarian & Filter Grid -->
          <div class="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <!-- Search Bar (Standard) -->
            <div class="md:col-span-4 space-y-2 text-left">
              <Label class="text-[10px] font-bold uppercase text-muted-foreground flex items-center tracking-wider">
                <Search class="h-3 w-3 mr-1" /> Pencarian Cepat
              </Label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  v-model="searchQuery" 
                  :placeholder="searchPlaceholder" 
                  class="pl-9 h-10 bg-background border-border shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-foreground"
                />
              </div>
            </div>

            <!-- Custom Filters Slot -->
            <div class="md:col-span-8">
              <div class="flex flex-wrap md:flex-nowrap gap-3 items-end justify-start md:justify-end">
                <slot name="filters" :handleFilterChange="() => currentPage = 1"></slot>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>

    <!-- Main Table Card -->
    <Card class="overflow-hidden shadow-md border-border ring-1 ring-border">
      <CardHeader v-if="title" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b bg-background relative">
        <div class="space-y-1 text-left w-full sm:w-auto">
          <div class="flex items-center justify-between">
            <CardTitle class="text-xl font-bold tracking-tight text-foreground">{{ title }}</CardTitle>
            
            <!-- Mobile Filter Trigger (App Style) -->
            <div class="md:hidden flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" class="h-10 w-10 rounded-xl border-2 border-border/50 shadow-sm active:scale-95 transition-all">
                    <SlidersHorizontal class="h-4 w-4 text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" class="rounded-t-[32px] p-8 space-y-6 pb-12 outline-none border-t-4 border-primary/20">
                  <SheetHeader class="text-left">
                    <SheetTitle class="text-2xl font-black tracking-tighter">Filter & Cari</SheetTitle>
                    <SheetDescription class="text-xs font-medium">Sesuaikan tampilan data untuk memudahkan pencarian Anda.</SheetDescription>
                  </SheetHeader>
                  
                  <div class="space-y-6">
                    <!-- Mobile Search Input -->
                    <div class="space-y-2 text-left">
                      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pencarian</Label>
                      <div class="relative">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          v-model="searchQuery" 
                          :placeholder="searchPlaceholder" 
                          class="pl-10 h-12 bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-6">
                      <slot name="filters" :handleFilterChange="() => currentPage = 1"></slot>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <CardDescription v-if="description" class="text-[11px] text-muted-foreground">{{ description }}</CardDescription>
        </div>
        <div v-if="showAddButton" class="w-full sm:w-auto">
            <slot name="add-button">
                 <Button size="sm" @click="emit('add')" class="w-full sm:w-auto shadow-sm">
                    <slot name="add-icon"></slot>
                    {{ addButtonLabel }}
                </Button>
            </slot>
        </div>
      </CardHeader>
      
      <CardContent class="p-0">
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50 hover:bg-muted/50 border-b-2 border-border">
                <TableHead v-for="col in columns" :key="col.key" :class="[col.align === 'right' ? 'text-right' : 'text-left', col.class, 'py-4 px-6 text-slate-900 font-bold uppercase text-[10px] sm:text-xs tracking-wider']">
                  {{ col.label }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- Loading State -->
              <TableRow v-if="loading">
                <TableCell :colspan="columns.length" class="h-32 text-center">
                  <Loader2 class="h-8 w-8 animate-spin mx-auto text-primary/40" />
                </TableCell>
              </TableRow>
              <!-- Empty State -->
              <TableRow v-else-if="filteredItems.length === 0">
                <TableCell :colspan="columns.length" class="h-32 text-center text-muted-foreground italic">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
              <!-- Data Rows -->
              <TableRow 
                v-else
                v-for="item in paginatedItems" 
                :key="item.id || item.index"
                class="group transition-colors even:bg-muted/50 hover:bg-muted/40 cursor-pointer border-b border-border/40"
                @click="handleRowClick(item)"
              >
                <TableCell 
                    v-for="col in columns" 
                    :key="col.key" 
                    :class="[col.align === 'right' ? 'text-right' : 'text-left', col.class, 'py-3 px-6']"
                >
                  <div v-if="col.isAction" class="relative h-10 px-2 flex items-center justify-end overflow-hidden">
                      <div class="transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:pointer-events-none absolute right-2">
                        <slot :name="`cell-${col.key}`" :item="item">
                          {{ item[col.key] }}
                        </slot>
                      </div>
                      <div class="flex items-center gap-1 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto absolute right-2 whitespace-nowrap">
                         <slot name="actions" :item="item"></slot>
                      </div>
                  </div>
                  <div v-else :class="col.align === 'right' ? 'flex justify-end' : 'flex justify-start'">
                    <slot :name="`cell-${col.key}`" :item="item">
                      <span class="text-xs sm:text-sm">{{ item[col.key] }}</span>
                    </slot>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Mobile List View (Modern App Style) -->
        <div class="md:hidden p-4 space-y-4 bg-muted/20 min-h-[400px]">
          <!-- Loading State -->
          <div v-if="loading" class="p-12 text-center">
            <Loader2 class="h-8 w-8 animate-spin mx-auto text-primary/40" />
            <p class="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">Memuat Data...</p>
          </div>
          <!-- Empty State -->
          <div v-else-if="filteredItems.length === 0" class="p-12 text-center bg-card rounded-3xl border border-dashed border-border/50 shadow-inner">
            <p class="text-sm text-muted-foreground italic font-medium">Tidak ada data ditemukan.</p>
          </div>
          <!-- Card Items (Modern App Card) -->
          <div 
            v-else
            v-for="item in paginatedItems" 
            :key="item.id || item.index"
            class="bg-card rounded-[24px] border border-border/50 shadow-sm overflow-hidden active:scale-[0.98] transition-all duration-200"
            @click="handleRowClick(item)"
          >
            <!-- Card Header: Profile & Actions -->
            <div class="p-4 flex items-start justify-between border-b border-border/5 gap-3">
              <div class="flex-1 min-w-0">
                <slot :name="`cell-${columns[0].key}`" :item="item">
                  <span class="font-bold text-sm text-foreground truncate block">{{ item[columns[0].key] }}</span>
                </slot>
              </div>
              <!-- Actions Area -->
              <div class="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full border border-border/30 shadow-inner" @click.stop>
                <slot name="actions" :item="item"></slot>
              </div>
            </div>
            
            <!-- Card Body: Content & Details -->
            <div class="p-4 space-y-3">
              <!-- Grid Details -->
              <div class="grid grid-cols-1 gap-2">
                <div v-for="col in columns.slice(1, -2)" :key="col.key" class="text-left">
                  <slot :name="`cell-${col.key}`" :item="item">
                    <span class="text-[11px] text-muted-foreground font-medium">{{ item[col.key] }}</span>
                  </slot>
                </div>
              </div>

              <!-- Footer Style: Status & Date -->
              <div class="flex items-center justify-between pt-3 border-t border-border/10">
                <div class="flex flex-col gap-1">
                  <!-- Status Column (Usually 2nd to last) -->
                  <slot :name="`cell-${columns[columns.length - 2].key}`" :item="item">
                    <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{{ columns[columns.length - 2].label }}</span>
                    <span class="text-xs font-bold">{{ item[columns[columns.length - 2].key] }}</span>
                  </slot>
                </div>
                
                <div class="text-right">
                  <!-- Date/Time Column (Last) -->
                  <slot :name="`cell-${columns[columns.length - 1].key}`" :item="item">
                    <span class="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60 block mb-0.5">{{ columns[columns.length - 1].label }}</span>
                    <span class="text-[11px] font-mono font-bold text-foreground">{{ item[columns[columns.length - 1].key] }}</span>
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Bar (Professional Style) -->
        <div class="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-t bg-muted/5 gap-4">
          <div class="text-[10px] sm:text-xs text-muted-foreground font-medium order-2 sm:order-1">
            Menampilkan <span class="text-foreground font-bold">{{ paginatedItems.length }}</span> dari <span class="text-foreground font-bold">{{ totalDataCount }}</span> data
          </div>
          
          <div class="flex items-center gap-1.5 order-1 sm:order-2">
            <!-- First Page -->
            <Button 
              variant="outline" 
              size="sm" 
              class="h-8 w-8 p-0 border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
              :disabled="currentPage === 1"
              @click.stop="currentPage = 1"
            >
              <ChevronsLeft class="h-4 w-4" />
            </Button>

            <!-- Prev Page -->
            <Button 
              variant="outline" 
              size="sm" 
              class="h-8 w-8 p-0 border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
              :disabled="currentPage === 1"
              @click.stop="currentPage--"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <!-- Page Numbers (Smart Slice) -->
            <div class="flex items-center gap-1 mx-1">
              <template v-for="p in displayedPages" :key="p">
                <div v-if="p === '...'" class="text-muted-foreground px-1 text-xs">...</div>
                <Button
                  v-else
                  variant="ghost"
                  size="sm"
                  :class="[
                    'h-8 min-w-[32px] px-2 text-[10px] sm:text-xs font-bold transition-all rounded-md',
                    currentPage === p ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-primary/10 hover:text-primary'
                  ]"
                  @click.stop="currentPage = p"
                >
                  {{ p }}
                </Button>
              </template>
            </div>

            <!-- Next Page -->
            <Button 
              variant="outline" 
              size="sm" 
              class="h-8 w-8 p-0 border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
              :disabled="currentPage === totalPages"
              @click.stop="currentPage++"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>

            <!-- Last Page -->
            <Button 
              variant="outline" 
              size="sm" 
              class="h-8 w-8 p-0 border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
              :disabled="currentPage === totalPages"
              @click.stop="currentPage = totalPages"
            >
              <ChevronsRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- Floating Action Button (Mobile Only) -->
    <div class="md:hidden fixed bottom-6 right-6 z-50">
      <Button 
        v-if="showAddButton"
        @click="emit('add')" 
        class="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground border-4 border-background flex items-center justify-center active:scale-90 transition-all duration-200"
      >
        <Plus class="h-6 w-6" />
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Standard Zebra & Hover is handled by Tailwind classes */
</style>
