/** Sales handlers using per-month tabs (YYYY-MM) */
function salesHandlePost(payload) {
  const propKey = 'SHEET_ID_SALES'
  const sid = PropertiesService.getScriptProperties().getProperty(propKey)
  if (!sid)
    return jsonResponse({ success: false, error: 'Sheet ID not configured: ' + propKey }, 500)

  const ss = SpreadsheetApp.openById(sid)
  let date = payload && payload.date ? new Date(payload.date) : new Date()
  if (isNaN(date.getTime())) date = new Date()
  const monthName = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM')

  let sheet = ss.getSheetByName(monthName)
  if (!sheet) sheet = ss.insertSheet(monthName)

  ensureHeader(sheet, payload)
  const row = Object.keys(payload).map((k) => payload[k])
  sheet.appendRow(row)
  return jsonResponse({ success: true, month: monthName })
}

function salesHandleGet(e) {
  const propKey = 'SHEET_ID_SALES'
  const sid = PropertiesService.getScriptProperties().getProperty(propKey)
  if (!sid)
    return jsonResponse({ success: false, error: 'Sheet ID not configured: ' + propKey }, 500)
  const ss = SpreadsheetApp.openById(sid)

  const month =
    e.parameter.month || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM')
  const sheet = ss.getSheetByName(month)
  if (!sheet) return jsonResponse({ success: true, rows: [] })

  const data = sheet.getDataRange().getValues()
  const headers = data[0] || []
  const rows = data.slice(1).map((r) => {
    const obj = {}
    headers.forEach((h, i) => (obj[h || `col${i}`] = r[i]))
    return obj
  })
  return jsonResponse({ success: true, month: month, rows: rows })
}
