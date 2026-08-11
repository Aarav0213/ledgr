const MERCHANT_SUFFIX_RE = /\brecurring\b$/i

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()

const stripInjectedRecurringLabel = (merchantName) =>
  normalizeText(merchantName).replace(MERCHANT_SUFFIX_RE, '').trim()

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const daysBetween = (a, b) => Math.round((b.getTime() - a.getTime()) / 86400000)

const median = (values) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const classifyRecurringTransactions = (transactions = []) => {
  const enriched = transactions.map((transaction) => ({
    ...transaction,
    merchant_name: stripInjectedRecurringLabel(transaction.merchant_name),
    is_recurring: false,
    recurring_confidence: 0,
    recurring_group: null,
  }))

  const groups = new Map()
  for (const transaction of enriched) {
    const date = toDate(transaction.transaction_date)
    if (!date) continue
    const key = `${transaction.merchant_name || ''}::${transaction.amount ?? ''}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ transaction, date })
  }

  const now = new Date()
  const lookbackStart = new Date(now)
  lookbackStart.setDate(lookbackStart.getDate() - 90)

  for (const [key, items] of groups.entries()) {
    const recentItems = items
      .filter(({ date }) => date >= lookbackStart && date <= now)
      .sort((a, b) => a.date - b.date)

    if (recentItems.length < 3) continue

    const intervals = []
    for (let i = 1; i < recentItems.length; i += 1) {
      intervals.push(daysBetween(recentItems[i - 1].date, recentItems[i].date))
    }

    const typicalGap = median(intervals)
    const consistentGap = intervals.every((gap) => Math.abs(gap - typicalGap) <= 7)
    const amountStable = new Set(recentItems.map(({ transaction }) => Number(transaction.amount).toFixed(2))).size === 1
    const hasRecentPresence = recentItems[recentItems.length - 1].date >= lookbackStart

    if (!consistentGap || !amountStable || !hasRecentPresence) continue

    for (const { transaction } of recentItems) {
      transaction.is_recurring = true
      transaction.recurring_confidence = 0.85
      transaction.recurring_group = key
      transaction.recurring_cadence_days = Math.round(typicalGap)
      transaction.merchant_name = stripInjectedRecurringLabel(transaction.merchant_name)
    }
  }

  return enriched
}

const shouldTreatAsReceiptEmail = ({ subject = '', from = '', body = '' } = {}) => {
  const haystack = normalizeText(`${subject} ${from} ${body}`).toLowerCase()

  const blockedPatterns = [
    /my best buy memberships?/i,
    /\breward\b/i,
    /\bactivation\b/i,
    /\bwelcome\b/i,
    /\bnyu\b/i,
    /\bregistration\b/i,
    /\bevent\b/i,
    /\bscholarship\b/i,
    /\bapplication\b/i,
    /\bessay\b/i,
    /\bgeneric ai is hurting your scholarship applications\b/i,
  ]

  if (blockedPatterns.some((pattern) => pattern.test(haystack))) {
    return false
  }

  const receiptSignals = [
    /\breceipt\b/i,
    /\border confirmation\b/i,
    /\bpayment received\b/i,
    /\bthank you for your purchase\b/i,
    /\binvoice\b/i,
    /\bshipment\b/i,
    /\bshipping confirmation\b/i,
    /\bpurchase\b/i,
  ]

  const merchantSignals = [
    /\bamazon\b/i,
    /\bstarbucks\b/i,
    /\buyber\b/i,
    /\bdoordash\b/i,
    /\bbest buy\b/i,
    /\btarget\b/i,
    /\bwalmart\b/i,
  ]

  return receiptSignals.some((pattern) => pattern.test(haystack)) || merchantSignals.some((pattern) => pattern.test(haystack))
}

module.exports = {
  classifyRecurringTransactions,
  normalizeText,
  shouldTreatAsReceiptEmail,
  stripInjectedRecurringLabel,
}
