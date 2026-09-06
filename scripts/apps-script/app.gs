/**
 * Simple Apps Script web app routing for entity-based Sheets APIs.
 *
 * Configure script properties: SHEET_ID_SALES, SHEET_ID_PURCHASE, SHEET_ID_CASH, SHEET_ID_CREDIT
 */

function doGet(e) {
  return handleRequest('GET', e)
}

function doPost(e) {
  return handleRequest('POST', e)
}

function handleRequest(method, e) {
  const path = (e.pathInfo || e.parameter.path || '').replace(/^\//, '')
  const parts = path.split('/').filter(Boolean)
  const entity = parts[0] || e.parameter.entity || ''
  try {
    if (method === 'POST') {
      const payload = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}
      return dispatchPost(entity, payload)
    } else {
      return dispatchGet(entity, e)
    }
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) }, 500)
  }
}

function dispatchPost(entity, payload) {
  switch (entity) {
    case 'sales':
      return typeof salesHandlePost === 'function'
        ? salesHandlePost(payload)
        : handleAppend('SHEET_ID_SALES', payload)
    case 'purchase':
      return typeof purchaseHandlePost === 'function'
        ? purchaseHandlePost(payload)
        : handleAppend('SHEET_ID_PURCHASE', payload)
    case 'cash':
      return typeof cashHandlePost === 'function'
        ? cashHandlePost(payload)
        : handleAppend('SHEET_ID_CASH', payload)
    case 'credit':
      return typeof creditHandlePost === 'function'
        ? creditHandlePost(payload)
        : handleAppend('SHEET_ID_CREDIT', payload)
    case 'customers':
      return handleAppend('SHEET_ID_CUSTOMERS', payload)
    default:
      return jsonResponse({ success: false, error: 'Unknown entity' }, 400)
  }
}

function dispatchGet(entity, e) {
  // simple list or last-n rows
  const n = parseInt(e.parameter.n || '20', 10)
  switch (entity) {
    case 'sales':
      return typeof salesHandleGet === 'function'
        ? salesHandleGet(e)
        : handleList('SHEET_ID_SALES', n)
    case 'purchase':
      return typeof purchaseHandleGet === 'function'
        ? purchaseHandleGet(e)
        : handleList('SHEET_ID_PURCHASE', n)
    case 'cash':
      return typeof cashHandleGet === 'function' ? cashHandleGet(e) : handleList('SHEET_ID_CASH', n)
    case 'credit':
      return typeof creditHandleGet === 'function'
        ? creditHandleGet(e)
        : handleList('SHEET_ID_CREDIT', n)
    case 'customers':
      return handleList('SHEET_ID_CUSTOMERS', n)
    default:
      return jsonResponse({ success: false, error: 'Unknown entity' }, 400)
  }
}

function handleAppend(propKey, payload) {
  const sid = PropertiesService.getScriptProperties().getProperty(propKey)
  if (!sid)
    return jsonResponse({ success: false, error: 'Sheet ID not configured: ' + propKey }, 500)

  const ss = SpreadsheetApp.openById(sid)
  const sheet = ss.getSheets()[0]
  ensureHeader(sheet, payload)
  const row = Object.keys(payload).map((k) => payload[k])
  sheet.appendRow(row)
  return jsonResponse({ success: true })
}

function handleList(propKey, n) {
  const sid = PropertiesService.getScriptProperties().getProperty(propKey)
  if (!sid)
    return jsonResponse({ success: false, error: 'Sheet ID not configured: ' + propKey }, 500)
  const ss = SpreadsheetApp.openById(sid)
  const sheet = ss.getSheets()[0]
  const data = sheet.getDataRange().getValues()
  const headers = data[0] || []
  const rows = data
    .slice(1)
    .slice(-n)
    .map((r) => {
      const obj = {}
      headers.forEach((h, i) => (obj[h || `col${i}`] = r[i]))
      return obj
    })
  return jsonResponse({ success: true, rows: rows })
}

function ensureHeader(sheet, payload) {
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  if (sheet.getLastRow() < 1 || header.every((h) => h === '')) {
    const keys = Object.keys(payload)
    if (keys.length === 0) return
    sheet.getRange(1, 1, 1, keys.length).setValues([keys])
  }
}

function jsonResponse(obj, code) {
  const output = ContentService.createTextOutput(JSON.stringify(obj))
  output.setMimeType(ContentService.MimeType.JSON)
  // Note: setting CORS headers isn't supported directly from Apps Script responses; if you need CORS,
  // consider calling the API from a server or setting up a proxy. See README for details.
  return output
}
