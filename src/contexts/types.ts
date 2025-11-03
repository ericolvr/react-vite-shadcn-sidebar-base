// Tipos para o contexto de autenticação
export interface User {
    id: number
    name: string
    role: number
    people_id: number
    mobile?: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
    login: (data: SignInResponse) => void
    logout: () => void
    hasRole: (requiredRole: number) => boolean
    getUserData: () => any
    isLoggedIn: () => boolean
    isLoading: boolean
}

// Tipo da resposta do SignIn (importado do service)
export interface SignInResponse {
    id: number
    name: string
    token: string
    role: number
    people_id: number
}

// Chaves do localStorage
export const STORAGE_KEYS = {
    USER: '@maintenance:user',
    TOKEN: '@maintenance:token',
    AUTH_DATA: '@maintenance:auth'
} as const
