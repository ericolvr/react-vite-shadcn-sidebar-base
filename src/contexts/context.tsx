import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextType, AuthState, SignInResponse, User } from './types'
// import { AuthStorage } from './storage'

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Props do provider
interface AuthProviderProps {
    children: ReactNode
}

// Provider do contexto de autenticação
export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        initializeAuth()
    }, [])

    const initializeAuth = async () => {
        try {
            setIsLoading(true)
            console.log('🔄 Contexto: Inicializando autenticação...')
            
            // Verificar se existe token no sessionStorage
            const token = sessionStorage.getItem('auth_token')
            const timestamp = sessionStorage.getItem('auth_timestamp')
            const hash = sessionStorage.getItem('auth_hash')
            
            if (token && timestamp && hash) {
                // Verificar se a sessão não expirou (8 horas)
                const sessionAge = Date.now() - parseInt(timestamp)
                const maxAge = 8 * 60 * 60 * 1000 // 8 horas em ms
                
                // Validar integridade do token
                const expectedHash = btoa(token.slice(-10))
                
                if (sessionAge < maxAge && hash === expectedHash) {
                    console.log('✅ Contexto: Sessão válida encontrada')
                    // Apenas o token é restaurado, dados do usuário precisam ser recarregados
                    setAuthState({
                        user: null, // Será preenchido quando necessário
                        token,
                        isAuthenticated: true
                    })
                } else {
                    console.log('⏰ Contexto: Sessão expirada ou inválida')
                    clearSession()
                }
            } else {
                console.log('🚫 Contexto: Nenhuma sessão encontrada')
            }
        } catch (error) {
            console.error('❌ Contexto: Erro ao inicializar autenticação:', error)
            clearSession()
        } finally {
            setIsLoading(false)
        }
    }

    const clearSession = () => {
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_timestamp')
        sessionStorage.removeItem('auth_hash')
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false
        })
    }

    const login = (data: SignInResponse) => {
        try {
            console.log('🔐 Contexto: Processando dados de login:', data)
            
            // Extrair dados do usuário da nova estrutura da API
            const user: User = {
                id: data.user.id,
                company_id: data.user.company_id,
                name: data.user.name,
                mobile: data.user.mobile,
                role: data.user.role
            }
            
            console.log('👤 Contexto: Dados do usuário processados:', user)
            console.log('🔑 Contexto: Token recebido:', data.token ? 'Presente' : 'Ausente')
            
            // 🛡️ ABORDAGEM SEGURA:
            // 1. Token no sessionStorage (perdido ao fechar aba)
            // 2. Dados do usuário apenas na memória (state)
            // 3. Hash do token para validação de integridade
            if (data.token) {
                // SessionStorage é mais seguro que localStorage
                sessionStorage.setItem('auth_token', data.token)
                sessionStorage.setItem('auth_timestamp', Date.now().toString())
                
                // Criar um hash simples para validação (opcional)
                const tokenHash = btoa(data.token.slice(-10)) // Últimos 10 chars em base64
                sessionStorage.setItem('auth_hash', tokenHash)
            }
            
            setAuthState({
                user,
                token: data.token,
                isAuthenticated: true
            })
            
            console.log('✅ Contexto: Estado de autenticação atualizado')
        } catch (error) {
            console.error('❌ Contexto: Erro ao fazer login:', error)
            throw error
        }
    }

    const logout = () => {
        try {
            console.log('🚪 Contexto: Fazendo logout...')
            
            // Limpar sessionStorage
            clearSession()
            
            console.log('✅ Contexto: Logout realizado com sucesso')
        } catch (error) {
            console.error('❌ Contexto: Erro ao fazer logout:', error)
        }
    }

    // Verificar se o usuário tem uma role específica
    const hasRole = (requiredRole: string): boolean => {
        if (!authState.user) return false
        return authState.user.role === requiredRole
    }

    // Função para obter dados específicos do usuário
    const getUserData = () => {
        return {
            id: authState.user?.id || null,
            company_id: authState.user?.company_id || null,
            name: authState.user?.name || '',
            mobile: authState.user?.mobile || '',
            role: authState.user?.role || '',
            isAuthenticated: authState.isAuthenticated,
            token: authState.token
        }
    }

    // Função para verificar se está logado
    const isLoggedIn = (): boolean => {
        return authState.isAuthenticated && !!authState.token
    }

    // Valor do contexto
    const contextValue: AuthContextType = {
        ...authState,
        isLoading,
        login,
        logout,
        hasRole,
        getUserData,
        isLoggedIn
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook para usar o contexto
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}

// Hook para componentes que requerem autenticação
export function useRequireAuth(): AuthContextType {
    const auth = useAuth()
    
    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            // Redirecionar para login se não estiver autenticado
            window.location.href = '/'
        }
    }, [auth.isAuthenticated, auth.isLoading])
    
    return auth
}
