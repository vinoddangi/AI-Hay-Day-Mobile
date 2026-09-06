const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

function loadEntity(entity) {
  const file = path.join(dataDir, `${entity}.json`)
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return {}
  }
}

function saveEntity(entity, obj) {
  const file = path.join(dataDir, `${entity}.json`)
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8')
}

function monthKey(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 7)
  return d.toISOString().slice(0, 7)
}

function respondRows(res, rows) {
  return res.json({ success: true, rows })
}

;['sales', 'purchase', 'cash', 'credit'].forEach((entity) => {
  app.post('/' + entity, (req, res) => {
    const payload = req.body || {}
    const key = monthKey(payload.date)
    const store = loadEntity(entity)
    store[key] = store[key] || []
    store[key].push(payload)
    saveEntity(entity, store)
    res.json({ success: true, month: key })
  })

  app.get('/' + entity, (req, res) => {
    const month = req.query.month || monthKey()
    const store = loadEntity(entity)
    const rows = store[month] || []
    respondRows(res, rows)
  })
})

// customers
app.post('/customers', (req, res) => {
  const payload = req.body || {}
  const store = loadEntity('customers')
  store.list = store.list || []
  store.list.push(payload)
  saveEntity('customers', store)
  res.json({ success: true })
})

app.get('/customers', (req, res) => {
  const store = loadEntity('customers')
  respondRows(res, store.list || [])
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Mock Apps Script API listening on http://localhost:${port}`))
