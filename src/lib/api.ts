import { supabase } from './supabase'
import type { Parent, Child, TariffPlan, SessionWithDetails } from '../types'

export class BraceletAPI {
  // Get all tariff plans
  static async getTariffPlans(): Promise<TariffPlan[]> {
    const { data, error } = await supabase
      .from('tariff_plans')
      .select('*')
      .order('price', { ascending: true })

    if (error) throw error
    
    // Convert duration_hours to duration_minutes for type compatibility
    return (data || []).map(plan => ({
      ...plan,
      duration_minutes: plan.duration_hours * 60
    }))
  }

  // Check bracelet by code
  static async getBraceletByCode(code: string) {
    const { data, error } = await supabase
      .from('bracelets')
      .select('*')
      .eq('bracelet_code', code)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Create or find parent
  static async createOrFindParent(name: string, phone: string, email?: string): Promise<Parent> {
    // First try to find existing parent by phone
    const { data: existing } = await supabase
      .from('parents')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existing) {
      // Update data if needed
      const { data, error } = await supabase
        .from('parents')
        .update({ name, email })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    }

          // Create new parent
    const { data, error } = await supabase
      .from('parents')
      .insert({ name, phone, email })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Create child
  static async createChild(parentId: string, name?: string): Promise<Child> {
    const { data, error } = await supabase
      .from('children')
      .insert({ parent_id: parentId, name })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Create or find bracelet
  static async createOrFindBracelet(code: string) {
    let bracelet = await this.getBraceletByCode(code)
    
    if (!bracelet) {
      const { data, error } = await supabase
        .from('bracelets')
        .insert({ bracelet_code: code, status: 'active' })
        .select()
        .single()

      if (error) throw error
      bracelet = data
    }

    return bracelet
  }

  // Register new bracelet session
  static async registerBracelet(
    braceletCode: string,
    parentName: string,
    parentPhone: string,
    childName: string | undefined,
    tariffPlanId: string,
    parentEmail?: string
  ): Promise<SessionWithDetails> {
    try {
      // 1. Create or find bracelet
      const bracelet = await this.createOrFindBracelet(braceletCode)

      // 2. Create or find parent
      const parent = await this.createOrFindParent(parentName, parentPhone, parentEmail)

      // 3. Create child
      const child = await this.createChild(parent.id, childName)

      // 4. Create bracelet session
      const { data: session, error: sessionError } = await supabase
        .from('bracelet_sessions')
        .insert({
          bracelet_id: bracelet.id,
          child_id: child.id,
          parent_id: parent.id,
          tariff_plan_id: tariffPlanId,
          status: 'inside',
          is_active: true
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // 5. Update bracelet status
      await supabase
        .from('bracelets')
        .update({ status: 'active' })
        .eq('id', bracelet.id)

      // 6. Log entry
      await supabase
        .from('entry_log')
        .insert({
          session_id: session.id,
          action: 'enter',
          notes: 'Initial entry - registration'
        })

      // 7. Get full session information
      return await this.getSessionWithDetails(session.id)
    } catch (error) {
      console.error('Error registering bracelet:', error)
      throw error
    }
  }

  // Get session with details
  static async getSessionWithDetails(sessionId: string): Promise<SessionWithDetails> {
    const { data, error } = await supabase
      .from('bracelet_sessions')
      .select(`
        *,
        bracelets!inner(*),
        children(*),
        parents!inner(*),
        tariff_plans!inner(*)
      `)
      .eq('id', sessionId)
      .single()

    if (error) throw error
    
    // Convert data to required format
    const session = {
      ...data,
      bracelet: data.bracelets,
      child: data.children,
      parent: data.parents,
      tariff_plan: {
        ...data.tariff_plans,
        duration_minutes: data.tariff_plans.duration_hours * 60
      }
    }
    
    return session as SessionWithDetails
  }

  // Get active session by bracelet code
  static async getActiveSessionByBraceletCode(code: string): Promise<SessionWithDetails | null> {
    const { data, error } = await supabase
      .from('bracelet_sessions')
      .select(`
        *,
        bracelets!inner(*),
        children(*),
        parents!inner(*),
        tariff_plans!inner(*)
      `)
      .eq('bracelets.bracelet_code', code)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null
    
    // Convert data to required format
    const session = {
      ...data,
      bracelet: data.bracelets,
      child: data.children,
      parent: data.parents,
      tariff_plan: {
        ...data.tariff_plans,
        duration_minutes: data.tariff_plans.duration_hours * 60
      }
    }
    
    return session as SessionWithDetails
  }

  // Toggle entry/exit status
  static async toggleEntryStatus(sessionId: string): Promise<{ action: 'enter' | 'exit'; session: SessionWithDetails }> {
    const session = await this.getSessionWithDetails(sessionId)
    const newStatus = session.status === 'inside' ? 'outside' : 'inside'
    const action = newStatus === 'inside' ? 'enter' : 'exit'

    // Update session status
    const { error: updateError } = await supabase
      .from('bracelet_sessions')
      .update({ status: newStatus })
      .eq('id', sessionId)

    if (updateError) throw updateError

    // Log entry
    const { error: logError } = await supabase
      .from('entry_log')
      .insert({
        session_id: sessionId,
        action
      })

    if (logError) throw logError

    const updatedSession = await this.getSessionWithDetails(sessionId)
    return { action, session: updatedSession }
  }

  // Get all active sessions
  static async getActiveSessions(): Promise<SessionWithDetails[]> {
    const { data, error } = await supabase
      .from('bracelet_sessions')
      .select(`
        *,
        bracelets!inner(*),
        children(*),
        parents!inner(*),
        tariff_plans!inner(*)
      `)
      .eq('is_active', true)
      .order('start_time', { ascending: false })

    if (error) throw error
    
    // Convert data to required format
    return (data || []).map(item => ({
      ...item,
      bracelet: item.bracelets,
      child: item.children,
      parent: item.parents,
      tariff_plan: {
        ...item.tariff_plans,
        duration_minutes: item.tariff_plans.duration_hours * 60
      }
    })) as SessionWithDetails[]
  }

  // End session
  static async endSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('bracelet_sessions')
      .update({ 
        is_active: false, 
        end_time: new Date().toISOString(),
        status: 'outside'
      })
      .eq('id', sessionId)

    if (error) throw error

    // Release bracelet
    const session = await this.getSessionWithDetails(sessionId)
    await supabase
      .from('bracelets')
      .update({ status: 'active' })
      .eq('id', session.bracelet_id)
  }

  // Search sessions
  static async searchSessions(query: string): Promise<SessionWithDetails[]> {
    const { data, error } = await supabase
      .from('bracelet_sessions')
      .select(`
        *,
        bracelets!inner(*),
        children(*),
        parents!inner(*),
        tariff_plans!inner(*)
      `)
      .eq('is_active', true)
      .or(`children.name.ilike.%${query}%,parents.name.ilike.%${query}%,parents.phone.ilike.%${query}%,bracelets.bracelet_code.ilike.%${query}%`)

    if (error) throw error
    
    // Convert data to required format
    return (data || []).map(item => ({
      ...item,
      bracelet: item.bracelets,
      child: item.children,
      parent: item.parents,
      tariff_plan: {
        ...item.tariff_plans,
        duration_minutes: item.tariff_plans.duration_hours * 60
      }
    })) as SessionWithDetails[]
  }
} 