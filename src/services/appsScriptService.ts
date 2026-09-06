const BASE = import.meta.env.VITE_APPS_SCRIPT_BASE || ''

async function postEntity(entity: string, data: any) {
  const url = `${BASE}/${entity}`.replace(/\/+/g, '/')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const AppsScriptService = {
  createSale: (payload: any) => postEntity('sales', payload),
  createPurchase: (payload: any) => postEntity('purchase', payload),
  createCash: (payload: any) => postEntity('cash', payload),
  createCredit: (payload: any) => postEntity('credit', payload),
  createCustomer: (payload: any) => postEntity('customers', payload),
  getCustomers: (params: any) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetch(`${BASE}/customers${q}`).then((r) => r.json())
  },
}

export default AppsScriptService
