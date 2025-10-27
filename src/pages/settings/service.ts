import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para CompanySettings
export type CompanySettingsData = {
	startWorkWeekday: string
	endWorkWeekday: string
	startWorkWeekend: string
	endWorkWeekend: string
	site?: string
	email?: string
	phone?: string
	mobile?: string
	company_id?: number
}

export type CompanySettingsResponse = CompanySettingsData & {
	id: number
	company_id: number
}

// Tipo de erro customizado da API
export type ApiError = {
	message: string
	status: number
	details?: any
}

class CompanySettingsService {

	// Verificar se configurações existem
	async checkSettingsExists(companyId: string): Promise<boolean> {
		try {
			const response: AxiosResponse<{ exists: boolean }> = await axios.get(
				`${BASE_URL}/companies/${companyId}/settings/exists`
			)
			return response.data.exists
		} catch (error: any) {
			// Se der erro 404, significa que não existe
			if (error.response?.status === 404) {
				return false
			}
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao verificar configurações',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar configurações da empresa
	async getSettings(companyId: string): Promise<CompanySettingsResponse> {
		try {
			const response: AxiosResponse<CompanySettingsResponse> = await axios.get(
				`${BASE_URL}/companies/${companyId}/settings`
			)
			return response.data
		} catch (error: any) {
			console.warn('API de configurações não encontrada, usando configurações padrão:', error.message)
			
			// Retornar configurações padrão se a API não estiver disponível
			return {
				id: 1,
				company_id: parseInt(companyId),
				startWorkWeekday: '08:00',
				endWorkWeekday: '18:00',
				startWorkWeekend: '09:00',
				endWorkWeekend: '17:00',
				site: 'localhost',
				email: 'contato@lavarapido.com',
				phone: '(11) 99999-9999',
				mobile: '(11) 88888-8888'
			}
		}
	}

	// Criar configurações da empresa
	async createSettings(companyId: string, data: CompanySettingsData): Promise<CompanySettingsResponse> {
		try {
			const response: AxiosResponse<CompanySettingsResponse> = await axios.post(
				`${BASE_URL}/companies/${companyId}/settings`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao criar configurações',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Atualizar configurações da empresa
	async updateSettings(companyId: string, data: CompanySettingsData): Promise<CompanySettingsResponse> {
		try {
			const response: AxiosResponse<CompanySettingsResponse> = await axios.put(
				`${BASE_URL}/companies/${companyId}/settings`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao atualizar configurações',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const companySettingsService = new CompanySettingsService()
