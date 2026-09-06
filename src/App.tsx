import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  useCreateSaleMutation,
  useGetCashQuery,
  useGetCreditQuery,
  useGetCustomersQuery,
  useGetPurchaseQuery,
  useGetSalesQuery,
} from './store/appsApi'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { closeMenu, openMenu, selectIsMenuOpen } from './store/uiSlice'

function AppHeader() {
  const dispatch = useAppDispatch()
  const isMenuOpen = useAppSelector(selectIsMenuOpen)
  const navigate = useNavigate()
  const location = useLocation()
  const showBack = location.pathname !== '/'

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
          {showBack ? (
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-700 transition hover:bg-slate-50"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-700 transition hover:bg-slate-50"
              aria-label="Open navigation"
              onClick={() => dispatch(openMenu())}
            >
              ☰
            </button>
          )}

          <div className="flex-1 text-center">
            <p className="text-base font-bold tracking-wide text-slate-900">AI Hay Day</p>
          </div>

          <div className="h-11 w-11" aria-hidden="true" />
        </div>
      </header>

      <Dialog open={isMenuOpen} onClose={() => dispatch(closeMenu())} className="relative z-50">
        <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
        <div className="fixed inset-y-0 left-0 w-[82vw] max-w-xs">
          <DialogPanel className="h-full w-full bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <DialogTitle className="text-lg font-semibold text-slate-900">Menu</DialogTitle>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => dispatch(closeMenu())}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2 p-3">
              {[
                { label: 'Dashboard', to: '/' },
                { label: 'Sales', to: '/sales' },
                { label: 'Purchase', to: '/purchase' },
              ].map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => dispatch(closeMenu())}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

function ScreenShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pt-5 pb-10">
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          AI Hay Day
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      </div>
      {children}
    </main>
  )
}

function SalesPage() {
  const count = useAppSelector((state) => state.ui.count)
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState('')
  const [createSale, { isLoading, isSuccess, isError }] = useCreateSaleMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { date, customer, amount }
    try {
      await createSale(payload).unwrap()
      setCustomer('')
      setAmount('')
    } catch (err) {
      // error handled via isError
    }
  }

  return (
    <ScreenShell title="Sales Entry">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <label className="block text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 ring-0 transition outline-none focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Customer
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer name"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 ring-0 transition outline-none focus:border-sky-400"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Amount
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 ring-0 transition outline-none focus:border-sky-400"
          />
        </label>

        <div className="flex items-center justify-between">
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {isLoading ? 'Saving...' : 'Save Sale'}
            </button>
          </div>
          <div className="text-sm text-slate-600">
            Outstanding: <span className="font-bold">₹ {count}</span>
          </div>
        </div>

        {isSuccess && <p className="text-sm text-green-600">Saved successfully.</p>}
        {isError && <p className="text-sm text-red-600">Failed to save. Try again.</p>}
      </form>
    </ScreenShell>
  )
}

function DashboardPage() {
  const month = new Date().toISOString().slice(0, 7) // yyyy-mm
  const { data: salesData } = useGetSalesQuery({ month })
  const { data: purchaseData } = useGetPurchaseQuery({ month })
  const { data: cashData } = useGetCashQuery({ month })
  const { data: creditData } = useGetCreditQuery({ month })
  const { data: customersData } = useGetCustomersQuery(undefined)

  const salesCount = salesData?.rows?.length ?? 0
  const purchaseCount = purchaseData?.rows?.length ?? 0
  const cashCount = cashData?.rows?.length ?? 0
  const creditCount = creditData?.rows?.length ?? 0
  const customersCount = customersData?.rows?.length ?? 0

  return (
    <ScreenShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Sales', value: salesCount },
          { label: 'Purchase', value: purchaseCount },
          { label: 'Cash', value: cashCount },
          { label: 'Credit', value: creditCount },
          { label: 'Customers', value: customersCount },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-xs tracking-wide text-slate-500 uppercase">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">Latest Sales</p>
        <ul className="mt-3 space-y-2">
          {(salesData?.rows || [])
            .slice(-5)
            .reverse()
            .map((r: any, idx: number) => (
              <li key={idx} className="text-sm text-slate-700">
                {JSON.stringify(r)}
              </li>
            ))}
        </ul>
      </div>
    </ScreenShell>
  )
}

function PurchasePage() {
  return (
    <ScreenShell title="Purchase">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">Purchase form will be added here.</p>
      </div>
    </ScreenShell>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AppHeader />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchase" element={<PurchasePage />} />
      </Routes>
    </div>
  )
}

export default App
