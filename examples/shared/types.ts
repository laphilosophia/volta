// Shared TypeScript types for all examples

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive'
  createdAt: string
  avatar?: string
}

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'lead' | 'prospect' | 'customer' | 'churned'
  value: number
  createdAt: string
  lastContactAt: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyGrowth: number
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    pageSize: number
  }
}
