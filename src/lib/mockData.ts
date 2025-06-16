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

// Mock active sessions
export const mockSessions: SessionWithDetails[] = [
  {
    id: '1',
    bracelet_id: '1',
    child_id: '1',
    parent_id: '1',
    tariff_plan_id: '1',
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_active: true,
    status: 'inside',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bracelet: mockBracelets[0],
    child: mockChildren[0],
    parent: mockParents[0],
    tariff_plan: mockTariffPlans[0],
    entry_logs: [
      {
        id: '1',
        session_id: '1',
        action: 'enter',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: 'First entry - registration'
      }
    ]
  },
  {
    id: '2',
    bracelet_id: '2',
    child_id: '2',
    parent_id: '2',
    tariff_plan_id: '2',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    is_active: true,
    status: 'outside',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bracelet: mockBracelets[1],
    child: mockChildren[1],
    parent: mockParents[1],
    tariff_plan: mockTariffPlans[1],
    entry_logs: [
      {
        id: '2',
        session_id: '2',
        action: 'enter',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        notes: 'First entry - registration'
      },
      {
        id: '3',
        session_id: '2',
        action: 'exit',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ]
  }
]

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