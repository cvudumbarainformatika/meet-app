<template>
  <Card class="overflow-hidden">
    <CardHeader>
      <CardTitle class="text-lg">{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      <div v-else :id="chartId" class="w-full" :style="{ height: chartHeight }"></div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Highcharts from 'highcharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  chartType: {
    type: String,
    default: 'column', // column, line, area, bar
    validator: (value) => ['column', 'line', 'area', 'bar'].includes(value)
  },
  categories: {
    type: Array,
    required: true
  },
  series: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  chartHeight: {
    type: String,
    default: '350px'
  },
  yAxisTitle: {
    type: String,
    default: 'Jumlah Pengunjung'
  }
})

const chartId = computed(() => `chart-${Math.random().toString(36).substr(2, 9)}`)
let chart = null

// Dark mode detection
const isDark = ref(false)

onMounted(() => {
  // Check if dark mode is active
  isDark.value = document.documentElement.classList.contains('dark')
  
  // Watch for theme changes
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
    if (chart) {
      initChart() // Reinitialize chart when theme changes
    }
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  
  initChart()
})

const initChart = () => {
  if (props.loading || !props.categories || !props.series) return

  const textColor = isDark.value ? '#e5e7eb' : '#374151'
  const gridColor = isDark.value ? '#374151' : '#f3f4f6'
  const tooltipBg = isDark.value ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'

  const options = {
    chart: {
      type: props.chartType,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    },
    credits: {
      enabled: false
    },
    title: {
      text: null
    },
    xAxis: {
      categories: props.categories,
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          fontSize: '12px',
          color: textColor
        }
      }
    },
    yAxis: {
      title: {
        text: props.yAxisTitle,
        style: {
          fontSize: '12px',
          fontWeight: '500',
          color: textColor
        }
      },
      gridLineDashStyle: 'Dash',
      gridLineColor: gridColor,
      labels: {
        style: {
          fontSize: '12px',
          color: textColor
        }
      }
    },
    tooltip: {
      shared: true,
      backgroundColor: tooltipBg,
      borderWidth: 1,
      borderRadius: 8,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 0,
        offsetY: 2,
        opacity: 0.1,
        width: 4
      },
      style: {
        fontSize: '12px',
        color: textColor
      },
      formatter: function() {
        let tooltip = `<b>${this.x}</b><br/>`
        this.points.forEach(point => {
          tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y.toLocaleString()}</b><br/>`
        })
        return tooltip
      }
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        pointPadding: 0.1,
        groupPadding: 0.15,
        dataLabels: {
          enabled: false
        }
      },
      line: {
        lineWidth: 3,
        marker: {
          radius: 4,
          symbol: 'circle'
        }
      },
      area: {
        fillOpacity: 0.3,
        marker: {
          radius: 4
        }
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      itemMarginBottom: 5,
      itemStyle: {
        fontWeight: 'normal',
        fontSize: '13px',
        color: textColor
      }
    },
    series: props.series
  }

  if (chart) {
    chart.destroy()
  }

  chart = Highcharts.chart(chartId.value, options)
}

watch(() => [props.series, props.categories, props.loading], () => {
  if (!props.loading) {
    setTimeout(() => {
      initChart()
    }, 100)
  }
}, { deep: true })
</script>
