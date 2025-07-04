import { TIME_CONSTANTS, DURATION_THRESHOLDS } from '../utils/constants'
import { formatCurrency, formatDuration, groupBy } from '../utils/formatters'
import type { SessionWithDetails } from '../types'

export interface AnalyticsData {
  totalRevenue: number
  totalVisitors: number
  currentlyInside: number
  currentlyOutside: number
  averageSessionTime: number
  peakHour: string
  todayEntries: number
  todayExits: number
  revenueGrowth?: number
  visitorGrowth?: number
}

export interface HourlyData {
  hour: number
  visitors: number
  revenue: number
  entries: number
  exits: number
}

export interface DailyData {
  date: string
  visitors: number
  revenue: number
  averageSessionTime: number
}

export interface DurationStats {
  short: number    // < 1 hour
  medium: number   // 1-3 hours
  long: number     // > 3 hours
}

export interface PopularTime {
  hour: number
  count: number
  percentage: number
}

class AnalyticsService {
  /**
   * Calculate basic analytics from sessions
   */
  calculateAnalytics(sessions: SessionWithDetails[]): AnalyticsData {
    const currentlyInside = sessions.filter(s => s.status === 'inside').length
    const currentlyOutside = sessions.filter(s => s.status === 'outside').length
    const totalRevenue = this.calculateTotalRevenue(sessions)
    const averageSessionTime = this.calculateAverageSessionTime(sessions)
    const peakHour = this.findPeakHour(sessions)
    
    // Count entries/exits for today
    const today = new Date().toDateString()
    const { todayEntries, todayExits } = this.countTodayActivities(sessions, today)

    return {
      totalRevenue,
      totalVisitors: sessions.length,
      currentlyInside,
      currentlyOutside,
      averageSessionTime,
      peakHour,
      todayEntries,
      todayExits
    }
  }

  /**
   * Calculate total revenue from sessions
   */
  calculateTotalRevenue(sessions: SessionWithDetails[]): number {
    return sessions.reduce((sum, session) => {
      return sum + (session.tariff_plan?.price || 0)
    }, 0)
  }

  /**
   * Calculate average session time in minutes
   */
  calculateAverageSessionTime(sessions: SessionWithDetails[]): number {
    const activeSessions = sessions.filter(s => s.start_time)
    
    if (activeSessions.length === 0) return 0

    const totalMinutes = activeSessions.reduce((sum, session) => {
      const start = new Date(session.start_time)
      const end = session.end_time ? new Date(session.end_time) : new Date()
      const durationMs = end.getTime() - start.getTime()
      return sum + (durationMs / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE)
    }, 0)

    return totalMinutes / activeSessions.length
  }

  /**
   * Find peak hour based on entry logs
   */
  findPeakHour(sessions: SessionWithDetails[]): string {
    const hourCounts: Record<number, number> = {}

    sessions.forEach(session => {
      if (session.entry_logs) {
        session.entry_logs.forEach(log => {
          if (log.action === 'enter') {
            const hour = new Date(log.timestamp).getHours()
            hourCounts[hour] = (hourCounts[hour] || 0) + 1
          }
        })
      }
    })

    const peakHour = Object.entries(hourCounts).reduce((peak, [hour, count]) => {
      return count > peak.count ? { hour: parseInt(hour), count } : peak
    }, { hour: 12, count: 0 })

    return `${peakHour.hour.toString().padStart(2, '0')}:00`
  }

  /**
   * Count today's entries and exits
   */
  countTodayActivities(sessions: SessionWithDetails[], today: string): { todayEntries: number; todayExits: number } {
    let todayEntries = 0
    let todayExits = 0

    sessions.forEach(session => {
      if (session.entry_logs) {
        session.entry_logs.forEach(log => {
          if (new Date(log.timestamp).toDateString() === today) {
            if (log.action === 'enter') {
              todayEntries++
            } else if (log.action === 'exit') {
              todayExits++
            }
          }
        })
      }
    })

    return { todayEntries, todayExits }
  }

  /**
   * Get hourly breakdown of activity
   */
  getHourlyBreakdown(sessions: SessionWithDetails[]): HourlyData[] {
    const hourlyData: Record<number, HourlyData> = {}

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = {
        hour,
        visitors: 0,
        revenue: 0,
        entries: 0,
        exits: 0
      }
    }

    sessions.forEach(session => {
      // Add revenue to start hour
      const startHour = new Date(session.start_time).getHours()
      hourlyData[startHour].revenue += session.tariff_plan?.price || 0
      hourlyData[startHour].visitors++

      // Count entries and exits
      if (session.entry_logs) {
        session.entry_logs.forEach(log => {
          const hour = new Date(log.timestamp).getHours()
          if (log.action === 'enter') {
            hourlyData[hour].entries++
          } else if (log.action === 'exit') {
            hourlyData[hour].exits++
          }
        })
      }
    })

    return Object.values(hourlyData).sort((a, b) => a.hour - b.hour)
  }

  /**
   * Get daily breakdown of activity
   */
  getDailyBreakdown(sessions: SessionWithDetails[], days: number = 7): DailyData[] {
    const dailyData: Record<string, DailyData> = {}
    const now = new Date()

    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split('T')[0]
      dailyData[dateString] = {
        date: dateString,
        visitors: 0,
        revenue: 0,
        averageSessionTime: 0
      }
    }

    // Group sessions by date
    const sessionsByDate: Record<string, SessionWithDetails[]> = {}
    sessions.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0]
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = []
      }
      sessionsByDate[date].push(session)
    })

    Object.entries(sessionsByDate).forEach(([date, dateSessions]) => {
      if (dailyData[date]) {
        dailyData[date].visitors = dateSessions.length
        dailyData[date].revenue = this.calculateTotalRevenue(dateSessions)
        dailyData[date].averageSessionTime = this.calculateAverageSessionTime(dateSessions)
      }
    })

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * Get duration statistics
   */
  getDurationStats(sessions: SessionWithDetails[]): DurationStats {
    const stats: DurationStats = {
      short: 0,
      medium: 0,
      long: 0
    }

    sessions.forEach(session => {
      const start = new Date(session.start_time)
      const end = session.end_time ? new Date(session.end_time) : new Date()
      const minutes = (end.getTime() - start.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE

      if (minutes < DURATION_THRESHOLDS.SHORT) {
        stats.short++
      } else if (minutes < DURATION_THRESHOLDS.MEDIUM) {
        stats.medium++
      } else {
        stats.long++
      }
    })

    return stats
  }

  /**
   * Get most popular visit times
   */
  getPopularTimes(sessions: SessionWithDetails[]): PopularTime[] {
    const hourCounts: Record<number, number> = {}
    let totalEntries = 0

    sessions.forEach(session => {
      if (session.entry_logs) {
        session.entry_logs.forEach(log => {
          if (log.action === 'enter') {
            const hour = new Date(log.timestamp).getHours()
            hourCounts[hour] = (hourCounts[hour] || 0) + 1
            totalEntries++
          }
        })
      }
    })

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get busiest days of the week
   */
  getBusiestDays(sessions: SessionWithDetails[]): { day: string; count: number; percentage: number }[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts: Record<number, number> = {}

    sessions.forEach(session => {
      const dayOfWeek = new Date(session.start_time).getDay()
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1
    })

    const totalSessions = sessions.length

    return Object.entries(dayCounts)
      .map(([day, count]) => ({
        day: dayNames[parseInt(day)],
        count,
        percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Calculate growth rates
   */
  calculateGrowthRates(currentPeriod: SessionWithDetails[], previousPeriod: SessionWithDetails[]): {
    revenueGrowth: number
    visitorGrowth: number
    timeGrowth: number
  } {
    const currentRevenue = this.calculateTotalRevenue(currentPeriod)
    const previousRevenue = this.calculateTotalRevenue(previousPeriod)

    const currentVisitors = currentPeriod.length
    const previousVisitors = previousPeriod.length

    const currentTime = this.calculateAverageSessionTime(currentPeriod)
    const previousTime = this.calculateAverageSessionTime(previousPeriod)

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    const visitorGrowth = previousVisitors > 0 
      ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 
      : 0

    const timeGrowth = previousTime > 0 
      ? ((currentTime - previousTime) / previousTime) * 100 
      : 0

    return {
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      visitorGrowth: Math.round(visitorGrowth * 100) / 100,
      timeGrowth: Math.round(timeGrowth * 100) / 100
    }
  }

  /**
   * Get sessions by tariff plan
   */
  getSessionsByTariff(sessions: SessionWithDetails[]): { name: string; count: number; revenue: number }[] {
    const tariffGroups = groupBy(sessions, 'tariff_plan')
    
    return Object.values(tariffGroups).map((groupSessions) => {
      const tariff = groupSessions[0]?.tariff_plan
      return {
        name: tariff?.name || 'Unknown',
        count: groupSessions.length,
        revenue: this.calculateTotalRevenue(groupSessions)
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }

  /**
   * Generate analytics report
   */
  generateReport(sessions: SessionWithDetails[]): {
    summary: AnalyticsData
    hourly: HourlyData[]
    daily: DailyData[]
    duration: DurationStats
    popularTimes: PopularTime[]
    busiestDays: { day: string; count: number; percentage: number }[]
    tariffBreakdown: { name: string; count: number; revenue: number }[]
  } {
    return {
      summary: this.calculateAnalytics(sessions),
      hourly: this.getHourlyBreakdown(sessions),
      daily: this.getDailyBreakdown(sessions),
      duration: this.getDurationStats(sessions),
      popularTimes: this.getPopularTimes(sessions),
      busiestDays: this.getBusiestDays(sessions),
      tariffBreakdown: this.getSessionsByTariff(sessions)
    }
  }

  /**
   * Format analytics for display
   */
  formatAnalyticsForDisplay(analytics: AnalyticsData): {
    revenue: string
    visitors: string
    averageTime: string
    occupancy: string
  } {
    return {
      revenue: formatCurrency(analytics.totalRevenue),
      visitors: analytics.totalVisitors.toString(),
      averageTime: formatDuration(new Date(Date.now() - analytics.averageSessionTime * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()),
      occupancy: `${analytics.currentlyInside}/${analytics.totalVisitors}`
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService()

// Export class for testing
export { AnalyticsService }
export default analyticsService 