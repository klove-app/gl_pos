export interface TariffPlan {
  id: string
  name: string
  description?: string
  duration_hours: number
  duration_minutes?: number
  price: number
  created_at: string
}

export interface Bracelet {
  id: string
  bracelet_code: string
  status: 'available' | 'active' | 'lost' | 'broken'
  created_at: string
  updated_at: string
}

export interface Parent {
  id: string
  name: string
  phone: string
  email?: string
  created_at: string
}

export interface Child {
  id: string
  name?: string
  parent_id: string
  created_at: string
}

export interface BraceletSession {
  id: string
  bracelet_id: string
  child_id: string
  parent_id: string
  tariff_plan_id: string
  start_time: string
  end_time?: string
  is_active: boolean
  status: 'inside' | 'outside'
  created_at: string
  updated_at: string
  
  // Related data
  bracelet?: Bracelet
  child?: Child
  parent?: Parent
  tariff_plan?: TariffPlan
}

export interface EntryLog {
  id: string
  session_id: string
  action: 'enter' | 'exit'
  timestamp: string
  notes?: string
}

export interface SessionWithDetails extends BraceletSession {
  bracelet: Bracelet
  child: Child
  parent: Parent
  tariff_plan: TariffPlan
  entry_logs?: EntryLog[]
}

export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: string
} 