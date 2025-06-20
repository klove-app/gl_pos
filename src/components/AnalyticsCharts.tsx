import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { Calendar, TrendingUp, BarChart3, PieChart, Activity, DollarSign } from 'lucide-react'
import type { SessionWithDetails } from '../types'
import './AnalyticsCharts.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
)

interface AnalyticsChartsProps {
  sessions: SessionWithDetails[]
}

interface ChartData {
  labels: string[]
  datasets: {
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    tension?: number
    fill?: boolean
    borderDash?: number[]
  }[]
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ sessions }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  
  // Генерация данных для графиков
  const generateChartData = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
    const currentPeriodEnd = endOfDay(new Date())
    const previousPeriodEnd = endOfDay(subDays(currentPeriodEnd, days))

    // Создаем массив дат для текущего периода
    const dateLabels = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i)
      return format(date, 'MMM dd')
    })

    // Функция для получения данных по дням
    const getDataByDay = (endDate: Date) => {
      const data: { [key: string]: {
        visitors: number
        entries: number
        exits: number
        revenue: number
        sessions: SessionWithDetails[]
      } } = {}
      
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - 1 - i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        
        const dayKey = format(date, 'MMM dd')
        
        // Фильтруем сессии по дате
        const daySessions = sessions.filter(session => {
          const sessionDate = new Date(session.created_at)
          return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd })
        })
        
        // Считаем количество входов/выходов за день
        const dayEntries = daySessions.reduce((count, session) => {
          return count + (session.entry_logs?.filter(log => 
            log.action === 'enter' && 
            isWithinInterval(new Date(log.timestamp), { start: dayStart, end: dayEnd })
          ).length || 0)
        }, 0)
        
        const dayExits = daySessions.reduce((count, session) => {
          return count + (session.entry_logs?.filter(log => 
            log.action === 'exit' && 
            isWithinInterval(new Date(log.timestamp), { start: dayStart, end: dayEnd })
          ).length || 0)
        }, 0)
        
        const dayRevenue = daySessions.reduce((sum, session) => {
          return sum + (session.tariff_plan?.price || 0)
        }, 0)
        
        data[dayKey] = {
          visitors: daySessions.length,
          entries: dayEntries,
          exits: dayExits,
          revenue: dayRevenue,
          sessions: daySessions
        }
      }
      
      return data
    }

    const currentData = getDataByDay(currentPeriodEnd)
    const previousData = getDataByDay(previousPeriodEnd)

    return { currentData, previousData, dateLabels }
  }

  const chartData = generateChartData()

  // График посещаемости по дням
  const visitorsChartData: ChartData = {
    labels: chartData.dateLabels,
    datasets: [
      {
        label: 'Текущий период',
        data: chartData.dateLabels.map(date => chartData.currentData[date]?.visitors || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Предыдущий период',
        data: chartData.dateLabels.map(date => chartData.previousData[date]?.visitors || 0),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      }
    ]
  }

  // График доходов
  const revenueChartData: ChartData = {
    labels: chartData.dateLabels,
    datasets: [
      {
        label: 'Доходы (текущий период)',
        data: chartData.dateLabels.map(date => chartData.currentData[date]?.revenue || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Доходы (предыдущий период)',
        data: chartData.dateLabels.map(date => chartData.previousData[date]?.revenue || 0),
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
      }
    ]
  }

  // График входов/выходов
  const entryExitChartData: ChartData = {
    labels: chartData.dateLabels,
    datasets: [
      {
        label: 'Входы',
        data: chartData.dateLabels.map(date => chartData.currentData[date]?.entries || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Выходы',
        data: chartData.dateLabels.map(date => chartData.currentData[date]?.exits || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      }
    ]
  }

  // Круговая диаграмма по тарифам
  const tariffData = sessions.reduce((acc, session) => {
    const tariffName = session.tariff_plan?.name || 'Неизвестно'
    acc[tariffName] = (acc[tariffName] || 0) + 1
    return acc
  }, {} as { [key: string]: number })

  const tariffChartData: ChartData = {
    labels: Object.keys(tariffData),
    datasets: [
      {
        data: Object.values(tariffData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      }
    ]
  }

  // График активности по часам
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourSessions = sessions.filter(session => {
      return session.entry_logs?.some(log => {
        const logHour = new Date(log.timestamp).getHours()
        return logHour === hour && log.action === 'enter'
      })
    })
    return hourSessions.length
  })

  const hourlyChartData: ChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Активность по часам',
        data: hourlyData,
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      }
    ]
  }

  // Расчет процентных изменений
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const currentTotal = Object.values(chartData.currentData).reduce((sum, day) => sum + day.visitors, 0)
  const previousTotal = Object.values(chartData.previousData).reduce((sum, day) => sum + day.visitors, 0)
  const visitorsChange = calculatePercentageChange(currentTotal, previousTotal)

  const currentRevenue = Object.values(chartData.currentData).reduce((sum, day) => sum + day.revenue, 0)
  const previousRevenue = Object.values(chartData.previousData).reduce((sum, day) => sum + day.revenue, 0)
  const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
  }

  return (
    <div className="analytics-charts">
      <div className="analytics-header">
        <h2>📈 Аналитические Графики</h2>
        <div className="period-selector">
          <button 
            className={selectedPeriod === '7d' ? 'active' : ''}
            onClick={() => setSelectedPeriod('7d')}
          >
            7 дней
          </button>
          <button 
            className={selectedPeriod === '30d' ? 'active' : ''}
            onClick={() => setSelectedPeriod('30d')}
          >
            30 дней
          </button>
          <button 
            className={selectedPeriod === '90d' ? 'active' : ''}
            onClick={() => setSelectedPeriod('90d')}
          >
            90 дней
          </button>
        </div>
      </div>

      {/* Краткая статистика сравнения */}
      <div className="comparison-stats">
        <div className="comparison-card">
          <div className="comparison-icon">
            <TrendingUp size={24} />
          </div>
          <div className="comparison-content">
            <h3>Посетители</h3>
            <div className="comparison-value">
              <span className="current">{currentTotal}</span>
              <span className={`change ${visitorsChange >= 0 ? 'positive' : 'negative'}`}>
                {visitorsChange >= 0 ? '+' : ''}{visitorsChange.toFixed(1)}%
              </span>
            </div>
            <p>По сравнению с предыдущим периодом</p>
          </div>
        </div>

        <div className="comparison-card">
          <div className="comparison-icon">
            <DollarSign size={24} />
          </div>
          <div className="comparison-content">
            <h3>Доходы</h3>
            <div className="comparison-value">
              <span className="current">${currentRevenue}</span>
              <span className={`change ${revenueChange >= 0 ? 'positive' : 'negative'}`}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
              </span>
            </div>
            <p>По сравнению с предыдущим периодом</p>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="charts-grid">
        {/* График посещаемости */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>👥 Динамика посещаемости</h3>
            <BarChart3 size={20} />
          </div>
          <div className="chart-wrapper">
            <Line data={visitorsChartData} options={chartOptions} />
          </div>
        </div>

        {/* График доходов */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>💰 Доходы по дням</h3>
            <TrendingUp size={20} />
          </div>
          <div className="chart-wrapper">
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* График входов/выходов */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>🚪 Входы и выходы</h3>
            <Activity size={20} />
          </div>
          <div className="chart-wrapper">
            <Bar data={entryExitChartData} options={chartOptions} />
          </div>
        </div>

        {/* Активность по часам */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>🕐 Активность по часам</h3>
            <Calendar size={20} />
          </div>
          <div className="chart-wrapper">
            <Bar data={hourlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Распределение по тарифам */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>🎯 Популярность тарифов</h3>
            <PieChart size={20} />
          </div>
          <div className="chart-wrapper">
            <Doughnut data={tariffChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Дополнительная круговая диаграмма - статус посетителей */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>📊 Текущий статус</h3>
            <PieChart size={20} />
          </div>
          <div className="chart-wrapper">
            <Pie 
              data={{
                labels: ['Внутри', 'Снаружи'],
                datasets: [{
                  data: [
                    sessions.filter(s => s.status === 'inside').length,
                    sessions.filter(s => s.status === 'outside').length
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)'
                  ],
                  borderWidth: 2,
                }]
              }}
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts 