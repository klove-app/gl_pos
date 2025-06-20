import type { TariffPlan, SessionWithDetails, Bracelet, Child, Parent } from '../types'

// Mock tariff plans
export const mockTariffPlans: TariffPlan[] = [
  {
    id: '1',
    name: '1 Day',
    description: 'Full day access',
    duration_hours: 24,
    price: 500,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '2 Hours',
    description: '2 hours access',
    duration_hours: 2,
    price: 200,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '4 Hours',
    description: '4 hours access',
    duration_hours: 4,
    price: 350,
    created_at: new Date().toISOString()
  }
]

// Mock bracelets
export const mockBracelets: Bracelet[] = [
  {
    id: '1',
    bracelet_code: 'BR-001',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    bracelet_code: 'BR-002',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock parents
export const mockParents: Parent[] = [
  {
    id: '1',
    name: 'Maria Popescu',
    phone: '+40 721 234 567',
          email: 'maria.popescu@example.com',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ion Ionescu',
    phone: '+40 722 345 678',
    created_at: new Date().toISOString()
  }
]

// Mock children
export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Sofia',
    parent_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Max',
    parent_id: '2',
    created_at: new Date().toISOString()
  }
]

// Генерация дополнительных мок данных для аналитики
const generateMockSessions = (): SessionWithDetails[] => {
  const sessions: SessionWithDetails[] = []
  const now = new Date()
  
  // Создаем сессии за последние 30 дней
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const sessionsPerDay = Math.floor(Math.random() * 15) + 5 // 5-20 сессий в день
    
    for (let sessionIndex = 0; sessionIndex < sessionsPerDay; sessionIndex++) {
      const sessionId = `session_${dayOffset}_${sessionIndex}`
      const braceletId = `bracelet_${dayOffset}_${sessionIndex}`
      const childId = `child_${dayOffset}_${sessionIndex}`
      const parentId = `parent_${dayOffset}_${sessionIndex}`
      
      // Случайное время в течение дня (9:00-21:00)
      const sessionHour = Math.floor(Math.random() * 12) + 9
      const sessionMinute = Math.floor(Math.random() * 60)
      const sessionStart = new Date(date)
      sessionStart.setHours(sessionHour, sessionMinute, 0, 0)
      
      // Случайная продолжительность сессии (30 минут - 4 часа)
      const sessionDurationMinutes = Math.floor(Math.random() * 210) + 30
      const sessionEnd = new Date(sessionStart.getTime() + sessionDurationMinutes * 60 * 1000)
      
      // Случайный тариф
      const tariffPlan = mockTariffPlans[Math.floor(Math.random() * mockTariffPlans.length)]
      
      // Создаем parent, child, bracelet для каждой сессии
      const parent: Parent = {
        id: parentId,
        name: `Родитель ${dayOffset}_${sessionIndex}`,
        phone: `+40 7${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `parent${dayOffset}_${sessionIndex}@example.com`,
        created_at: sessionStart.toISOString()
      }
      
      const child: Child = {
        id: childId,
        name: `Ребенок ${dayOffset}_${sessionIndex}`,
        parent_id: parentId,
        created_at: sessionStart.toISOString()
      }
      
      const bracelet: Bracelet = {
        id: braceletId,
        bracelet_code: `BR-${dayOffset.toString().padStart(2, '0')}${sessionIndex.toString().padStart(2, '0')}`,
        status: 'active',
        created_at: sessionStart.toISOString(),
        updated_at: sessionStart.toISOString()
      }
      
      // Создаем логи входов/выходов
      const entryLogs = []
      let currentTime = sessionStart
      let isInside = false
      let logId = 1
      
      while (currentTime < sessionEnd) {
        entryLogs.push({
          id: `${sessionId}_log_${logId}`,
          session_id: sessionId,
          action: (isInside ? 'exit' : 'enter') as 'enter' | 'exit',
          timestamp: currentTime.toISOString(),
          notes: isInside ? 'Exit from playground' : 'Enter playground'
        })
        
        // Следующий вход/выход через 15-90 минут
        const nextActionMinutes = Math.floor(Math.random() * 75) + 15
        currentTime = new Date(currentTime.getTime() + nextActionMinutes * 60 * 1000)
        isInside = !isInside
        logId++
      }
      
      // Определяем финальный статус
      const finalStatus = isInside ? 'inside' : 'outside'
      const isActive = dayOffset === 0 // только сегодняшние сессии активны
      
      const session: SessionWithDetails = {
        id: sessionId,
        bracelet_id: braceletId,
        child_id: childId,
        parent_id: parentId,
        tariff_plan_id: tariffPlan.id,
        start_time: sessionStart.toISOString(),
        is_active: isActive,
        status: finalStatus,
        created_at: sessionStart.toISOString(),
        updated_at: sessionEnd.toISOString(),
        bracelet,
        child,
        parent,
        tariff_plan: tariffPlan,
        entry_logs: entryLogs
      }
      
      sessions.push(session)
    }
  }
  
  return sessions
}

// Mock active sessions
export const mockSessions: SessionWithDetails[] = generateMockSessions()

// Mock API for testing
export class MockBraceletAPI {
  static async getTariffPlans(): Promise<TariffPlan[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockTariffPlans
  }

  static async getActiveSessions(): Promise<SessionWithDetails[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockSessions
  }

  static async searchSessions(query: string): Promise<SessionWithDetails[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (!query.trim()) return mockSessions
    
    const lowerQuery = query.toLowerCase()
    return mockSessions.filter(session => 
      session.child.name?.toLowerCase().includes(lowerQuery) ||
      session.parent.name.toLowerCase().includes(lowerQuery) ||
      session.parent.phone.includes(query) ||
      session.bracelet.bracelet_code.toLowerCase().includes(lowerQuery)
    )
  }

  static async getActiveSessionByBraceletCode(code: string): Promise<SessionWithDetails | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const session = mockSessions.find(s => 
      s.bracelet.bracelet_code === code && s.is_active
    )
    return session || null
  }

  static async toggleEntryStatus(sessionId: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const session = mockSessions.find(s => s.id === sessionId)
    if (session) {
      const newStatus = session.status === 'inside' ? 'outside' : 'inside'
      const action = newStatus === 'inside' ? 'enter' : 'exit'
      
      session.status = newStatus
      session.updated_at = new Date().toISOString()
      
      // Add entry to log
      session.entry_logs?.push({
        id: Date.now().toString(),
        session_id: sessionId,
        action,
        timestamp: new Date().toISOString()
      })
      
      return { action, session }
    }
    throw new Error('Session not found')
  }

  static async registerBracelet(
    braceletCode: string,
    parentName: string,
    parentPhone: string,
    childName: string | undefined,
    tariffPlanId: string,
    parentEmail?: string
  ): Promise<SessionWithDetails> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create new session
    const newSession: SessionWithDetails = {
      id: Date.now().toString(),
      bracelet_id: Date.now().toString(),
      child_id: Date.now().toString(),
      parent_id: Date.now().toString(),
      tariff_plan_id: tariffPlanId,
      start_time: new Date().toISOString(),
      is_active: true,
      status: 'inside',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bracelet: {
        id: Date.now().toString(),
        bracelet_code: braceletCode,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      child: {
        id: Date.now().toString(),
        name: childName,
        parent_id: Date.now().toString(),
        created_at: new Date().toISOString()
      },
      parent: {
        id: Date.now().toString(),
        name: parentName,
        phone: parentPhone,
        email: parentEmail,
        created_at: new Date().toISOString()
      },
      tariff_plan: mockTariffPlans.find(t => t.id === tariffPlanId) || mockTariffPlans[0],
      entry_logs: [{
        id: Date.now().toString(),
        session_id: Date.now().toString(),
        action: 'enter',
        timestamp: new Date().toISOString(),
                  notes: 'First entry - registration'
      }]
    }
    
    // Add to mock data
    mockSessions.push(newSession)
    
    return newSession
  }
} 