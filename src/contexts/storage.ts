import type { User, SignInResponse } from './types'
import { STORAGE_KEYS } from './types'



export class AuthStorage {
    static saveAuthData(data: SignInResponse): void {
        try {
            const user: User = {
                id: data.id,
                name: data.name,
                role: data.role,
                people_id: data.people_id
            }
            
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
            
            // Salvar dados completos para recuperação
            localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify({
                user,
                token: data.token,
                timestamp: Date.now()
            }))
        } catch (error) {
            console.error('Erro ao salvar dados de autenticação:', error)
        }
    }

    // Recuperar usuário do localStorage
    static getUser(): User | null {
        try {
            const userData = localStorage.getItem(STORAGE_KEYS.USER)
            return userData ? JSON.parse(userData) : null
        } catch (error) {
            console.error('Erro ao recuperar dados do usuário:', error)
            return null
        }
    }

    // Recuperar token do localStorage
    static getToken(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEYS.TOKEN)
        } catch (error) {
            console.error('Erro ao recuperar token:', error)
            return null
        }
    }

    // Verificar se há dados de autenticação válidos
    static hasValidAuth(): boolean {
        const user = this.getUser()
        const token = this.getToken()
        return !!(user && token)
    }

    // Limpar todos os dados de autenticação
    static clearAuthData(): void {
        try {
            localStorage.removeItem(STORAGE_KEYS.USER)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.AUTH_DATA)
        } catch (error) {
            console.error('Erro ao limpar dados de autenticação:', error)
        }
    }

    // Recuperar dados completos (para debug ou recuperação)
    static getAuthData(): { user: User; token: string; timestamp: number } | null {
        try {
            const authData = localStorage.getItem(STORAGE_KEYS.AUTH_DATA)
            return authData ? JSON.parse(authData) : null
        } catch (error) {
            console.error('Erro ao recuperar dados completos:', error)
            return null
        }
    }

    // Verificar se a sessão expirou (opcional - baseado em timestamp)
    static isSessionExpired(maxAgeHours: number = 24): boolean {
        try {
            const authData = this.getAuthData()
            if (!authData) return true

            const now = Date.now()
            const sessionAge = now - authData.timestamp
            const maxAge = maxAgeHours * 60 * 60 * 1000 // converter para ms

            return sessionAge > maxAge
        } catch (error) {
            console.error('Erro ao verificar expiração da sessão:', error)
            return true
        }
    }
}
