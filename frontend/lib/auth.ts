import Cookies from 'js-cookie'

export const setAuthToken = (token: string, role: string) => {
  Cookies.set(`token_${role}`, token, { expires: 7, path: '/' })
  Cookies.set(`role_${role}`, role, { expires: 7, path: '/' })
  
  Cookies.set('token', token, { expires: 7, path: '/' })
  Cookies.set('role', role, { expires: 7, path: '/' })
}

export const getAuthToken = (): string | undefined => {
  return Cookies.get('token')
}

export const getAuthTokenByRole = (role: string): string | undefined => {
  return Cookies.get(`token_${role}`)
}

export const getAuthRole = (): string | undefined => {
  return Cookies.get('role')
}

export const getAuthRoleByRole = (role: string): string | undefined => {
  return Cookies.get(`role_${role}`)
}

export const switchSession = (role: string) => {
  const token = getAuthTokenByRole(role)
  const roleValue = getAuthRoleByRole(role)
  
  if (token && roleValue) {
    Cookies.set('token', token, { expires: 7, path: '/' })
    Cookies.set('role', roleValue, { expires: 7, path: '/' })
    return true
  }
  return false
}

export const clearAuth = () => {
  // Clear current session
  Cookies.remove('token', { path: '/' })
  Cookies.remove('role', { path: '/' })
  
  // Clear all role-specific tokens
  Cookies.remove('token_customer', { path: '/' })
  Cookies.remove('token_admin', { path: '/' })
  Cookies.remove('role_customer', { path: '/' })
  Cookies.remove('role_admin', { path: '/' })
}

export const clearAuthByRole = (role: string) => {
  // Clear specific role tokens
  Cookies.remove(`token_${role}`, { path: '/' })
  Cookies.remove(`role_${role}`, { path: '/' })
  
  // If clearing current active role, clear current session too
  const currentRole = getAuthRole()
  if (currentRole === role) {
    Cookies.remove('token', { path: '/' })
    Cookies.remove('role', { path: '/' })
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!Cookies.get('token')
}

export const isAdmin = (): boolean => {
  return getAuthRole() === 'admin'
}

export const isCustomer = (): boolean => {
  return getAuthRole() === 'customer'
}

