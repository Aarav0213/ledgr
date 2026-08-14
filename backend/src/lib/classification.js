const MERCHANT_SUFFIX_RE = /(?:[\s\-_]*recurring)+$/i

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

const daysBetween = (a, b) =>
  Math.round((b.getTime() - a.getTime()) / 86400000)

const median = (values) => {
  if (!values.length) return null

  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

const classifyRecurringTransactions = (transactions = []) => {
  const enriched = transactions.map((transaction) => ({
    ...transaction,
    merchant_name: stripInjectedRecurringLabel(transaction.merchant_name),
    is_recurring: false,
    recurring_confidence: 0,
    recurring_group: null,
    recurring_cadence_days: null,
  }))

  const groups = new Map()

  for (const transaction of enriched) {
    const date = toDate(transaction.transaction_date)
    const merchant = transaction.merchant_name || ''

    if (!date || !merchant) continue

    const amount = Number(transaction.amount)

    if (!Number.isFinite(amount)) continue

    const key = `${merchant.toLowerCase()}::${amount.toFixed(2)}`

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push({
      transaction,
      date,
    })
  }

  for (const [key, items] of groups.entries()) {
    if (items.length < 3) continue

    const sortedItems = [...items].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )

    const intervals = []

    for (let i = 1; i < sortedItems.length; i += 1) {
      const gap = daysBetween(
        sortedItems[i - 1].date,
        sortedItems[i].date
      )

      if (gap > 0) {
        intervals.push(gap)
      }
    }

    if (intervals.length < 2) continue

    const typicalGap = median(intervals)

    if (!typicalGap || typicalGap <= 0) continue

    const consistentGap = intervals.every(
      (gap) => Math.abs(gap - typicalGap) <= Math.max(7, typicalGap * 0.25)
    )

    if (!consistentGap) continue

    const merchantName = sortedItems[0].transaction.merchant_name

    const recurringGroup = `${merchantName}::${Number(
      sortedItems[0].transaction.amount
    ).toFixed(2)}`

    for (const { transaction } of sortedItems) {
      transaction.is_recurring = true
      transaction.recurring_confidence = 0.85
      transaction.recurring_group = recurringGroup
      transaction.recurring_cadence_days = Math.round(typicalGap)
      transaction.merchant_name =
        stripInjectedRecurringLabel(transaction.merchant_name)
    }
  }

  return enriched
}

const shouldTreatAsReceiptEmail = ({
  subject = '',
  from = '',
  body = '',
} = {}) => {
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

  return (
    receiptSignals.some((pattern) => pattern.test(haystack)) ||
    merchantSignals.some((pattern) => pattern.test(haystack))
  )
}

module.exports = {
  classifyRecurringTransactions,
  normalizeText,
  shouldTreatAsReceiptEmail,
  stripInjectedRecurringLabel,
}
