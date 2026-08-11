const { createSupabaseForRequest } = require('../config/supabase.js')

const table = 'dashboard_alert_dismissals'

class AlertDismissal {
  static client(req) {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    return createSupabaseForRequest(token)
  }

  static async list(req) {
    const supabase = AlertDismissal.client(req)
    const { data, error } = await supabase.from(table).select('*').order('dismissed_at', { ascending: false })
    if (error) throw error
    return data
  }

  static async dismiss(req, dismissalData) {
    const supabase = AlertDismissal.client(req)
    const payload = {
      ...dismissalData,
      dismissed_at: dismissalData.dismissed_at || new Date().toISOString(),
    }
    const { data, error } = await supabase.from(table).upsert([payload], {
      onConflict: 'user_id,alert_key',
    }).select('*').single()
    if (error) throw error
    return data
  }
}

module.exports = AlertDismissal
