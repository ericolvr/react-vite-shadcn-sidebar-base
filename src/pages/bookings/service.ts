import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para Service (baseado na API)
export type BookingService = {
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
	services: BookingService[]
	total: number
	page: number
	limit: number
}

// Tipo para configurações da empresa
export type CompanySettings = {
	id: number
	company_id: number
	weekday_start: string // formato "08:00"
	weekday_end: string   // formato "18:00"
	weekend_start: string // formato "09:00"
	weekend_end: string   // formato "17:00"
	slot_duration: number // em minutos
	advance_booking_days: number
	created_at: string
	updated_at: string
}

// Tipo de erro customizado da API
export type ApiError = {
	message: string
	status: number
	details?: any
}

class BookingsService {

	// Buscar todos os serviços ativos da empresa
	async getServices(): Promise<BookingService[]> {
		try {
			const response: AxiosResponse<ServicesListResponse> = await axios.get(
				`${BASE_URL}/services?limit=100&offset=0`
			)
			
			// Filtrar apenas serviços ativos
			const activeServices = response.data.services.filter(service => service.active)
			
			return activeServices
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar serviços',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar configurações da empresa
	async getCompanySettings(companyId: number): Promise<CompanySettings> {
		try {
			const response: AxiosResponse<CompanySettings> = await axios.get(
				`${BASE_URL}/companies/${companyId}/settings`
			)
			
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar configurações da empresa',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const bookingsService = new BookingsService()
