import { delay, http, HttpResponse } from 'msw'
import type { Customer, User } from '../types'
import { mockCustomers, mockStats, mockUsers } from './data'

const API_BASE = '/api'

// Simulate network delay
const DELAY_MS = 300

export const handlers = [
  // ============================================================================
  // Users API
  // ============================================================================

  // GET /api/users
  http.get(`${API_BASE}/users`, async ({ request }) => {
    await delay(DELAY_MS)

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    let users = [...mockUsers]

    if (status) {
      users = users.filter((u) => u.status === status)
    }

    if (search) {
      users = users.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({
      data: users,
      meta: { total: users.length, page: 1, pageSize: 20 },
    })
  }),

  // GET /api/users/:id
  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(DELAY_MS)

    const user = mockUsers.find((u) => u.id === params.id)

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: user })
  }),

  // POST /api/users
  http.post(`${API_BASE}/users`, async ({ request }) => {
    await delay(DELAY_MS)

    const body = (await request.json()) as Partial<User>
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: body.name || 'New User',
      email: body.email || 'new@example.com',
      role: body.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    return HttpResponse.json({ data: newUser }, { status: 201 })
  }),

  // PUT /api/users/:id
  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await delay(DELAY_MS)

    const index = mockUsers.findIndex((u) => u.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = (await request.json()) as Partial<User>
    mockUsers[index] = { ...mockUsers[index], ...body }

    return HttpResponse.json({ data: mockUsers[index] })
  }),

  // DELETE /api/users/:id
  http.delete(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(DELAY_MS)

    const index = mockUsers.findIndex((u) => u.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockUsers.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // ============================================================================
  // Customers API
  // ============================================================================

  // GET /api/customers
  http.get(`${API_BASE}/customers`, async ({ request }) => {
    await delay(DELAY_MS)

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    let customers = [...mockCustomers]

    if (status) {
      customers = customers.filter((c) => c.status === status)
    }

    if (search) {
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(search) || c.company.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json(customers)
  }),

  // GET /api/customers/:id
  http.get(`${API_BASE}/customers/:id`, async ({ params }) => {
    await delay(DELAY_MS)

    const customer = mockCustomers.find((c) => c.id === params.id)

    if (!customer) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: customer })
  }),

  // POST /api/customers
  http.post(`${API_BASE}/customers`, async ({ request }) => {
    await delay(DELAY_MS)

    const body = (await request.json()) as Partial<Customer>
    const newCustomer: Customer = {
      id: String(mockCustomers.length + 1),
      name: body.name || 'New Customer',
      company: body.company || 'New Company',
      email: body.email || 'new@company.com',
      phone: body.phone || '+90 500 000 0000',
      status: body.status || 'lead',
      value: body.value || 0,
      createdAt: new Date().toISOString(),
      lastContactAt: new Date().toISOString(),
    }

    mockCustomers.push(newCustomer)
    return HttpResponse.json({ data: newCustomer }, { status: 201 })
  }),

  // ============================================================================
  // Dashboard Stats API
  // ============================================================================

  // GET /api/stats
  http.get(`${API_BASE}/stats`, async () => {
    await delay(DELAY_MS)
    return HttpResponse.json(mockStats)
  }),

  // ============================================================================
  // Layouts API (for Component Builder)
  // ============================================================================

  // GET /api/layouts
  http.get(`${API_BASE}/layouts`, async () => {
    await delay(DELAY_MS)
    return HttpResponse.json({ items: [] })
  }),

  // POST /api/layouts
  http.post(`${API_BASE}/layouts`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = await request.json()
    console.log('[MSW] Layout saved:', body)
    return HttpResponse.json({ success: true, savedAt: new Date().toISOString() })
  }),
]
