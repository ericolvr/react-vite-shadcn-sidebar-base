import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para Service
export type ServiceData = {
	name: string
	price: number
	duration: number
	vehicle_type: string
	points: number
	active: boolean
	company_id?: number
}

export type ServiceResponse = {
	id: number
	company_id: number
	name: string
	price: number
	duration: number
	vehicle_type: string
	points: number
	active: boolean
	created_at: string
	updated_at: string
}

// Tipo para a resposta da API de listagem
export type ServicesListResponse = {
	services: ServiceResponse[]
	total: number
	page: number
	limit: number
}

// Tipo de erro customizado da API
export type ApiError = {
	message: string
	status: number
	details?: any
}

class ServicesService {

	// Buscar todos os serviços da empresa
	async getServices(page: number = 1, limit: number = 20): Promise<ServicesListResponse> {
		try {
			// Converter page para offset (page 1 = offset 0)
			const offset = (page - 1) * limit
			
			const response: AxiosResponse<ServicesListResponse> = await axios.get(
				`${BASE_URL}/services?limit=${limit}&offset=${offset}`
			)
			
			// Simular resposta com page para compatibilidade
			const responseData = {
				...response.data,
				page: page,
				limit: limit
			}
			
			return responseData
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar serviços',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar um serviço específico
	async getService(companyId: string, serviceId: string): Promise<ServiceResponse> {
		try {
			const response: AxiosResponse<ServiceResponse> = await axios.get(
				`${BASE_URL}/companies/${companyId}/services/${serviceId}`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar serviço',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Criar novo serviço
	async createService(data: ServiceData): Promise<ServiceResponse> {
		try {
			const response: AxiosResponse<ServiceResponse> = await axios.post(
				`${BASE_URL}/services`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao criar serviço',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Atualizar serviço existente
	async updateService(companyId: string, serviceId: string, data: ServiceData): Promise<ServiceResponse> {
		try {
			const response: AxiosResponse<ServiceResponse> = await axios.put(
				`${BASE_URL}/companies/${companyId}/services/${serviceId}`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao atualizar serviço',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Deletar serviço
	async deleteService(companyId: string, serviceId: string): Promise<void> {
		try {
			await axios.delete(
				`${BASE_URL}/companies/${companyId}/services/${serviceId}`
			)
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao deletar serviço',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const servicesService = new ServicesService()
