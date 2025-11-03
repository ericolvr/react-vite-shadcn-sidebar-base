import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para Vehicle
export type VehicleData = {
	brand: string
	model: string
	plate: string
	type: string
	client_id: number
	company_id?: number
}

export type VehicleResponse = {
	id: number
	company_id: number
	client_id: number
	brand: string
	model: string
	plate: string
	type: string
	created_at: string
	updated_at: string
}

// Tipo para a resposta da API de listagem
export type VehiclesListResponse = {
	vehicles: VehicleResponse[]
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

class VehiclesService {

	// Buscar todos os veículos da empresa
	async getVehicles(companyId: number, page: number = 1, limit: number = 20): Promise<VehiclesListResponse> {
		try {
			// Converter page para offset (page 1 = offset 0)
			const offset = (page - 1) * limit
			
			// Sempre incluir company_id (obrigatório para multi-tenant)
			const url = `${BASE_URL}/vehicles?company_id=${companyId}&limit=${limit}&offset=${offset}`
			
			const response: AxiosResponse<VehiclesListResponse> = await axios.get(url)
			
			// Simular resposta com page para compatibilidade
			const responseData = {
				...response.data,
				page: page,
				limit: limit
			}
			
			return responseData
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar veículos',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar veículos de um cliente específico
	async getVehiclesByClient(companyId: number, clientId: string): Promise<VehicleResponse[]> {
		try {
			const response: AxiosResponse<VehicleResponse[]> = await axios.get(
				`${BASE_URL}/vehicles/client/${clientId}?company_id=${companyId}`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar veículos do cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar um veículo específico
	async getVehicle(vehicleId: string): Promise<VehicleResponse> {
		try {
			const response: AxiosResponse<VehicleResponse> = await axios.get(
				`${BASE_URL}/vehicles/${vehicleId}`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar veículo',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Criar novo veículo
	async createVehicle(data: VehicleData): Promise<VehicleResponse> {
		try {
			const response: AxiosResponse<VehicleResponse> = await axios.post(
				`${BASE_URL}/vehicles`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao criar veículo',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Atualizar veículo existente
	async updateVehicle(vehicleId: string, data: VehicleData): Promise<VehicleResponse> {
		try {
			const response: AxiosResponse<VehicleResponse> = await axios.put(
				`${BASE_URL}/vehicles/${vehicleId}`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao atualizar veículo',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Deletar veículo
	async deleteVehicle(vehicleId: string): Promise<void> {
		try {
			await axios.delete(
				`${BASE_URL}/vehicles/${vehicleId}`
			)
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao deletar veículo',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const vehiclesService = new VehiclesService()
