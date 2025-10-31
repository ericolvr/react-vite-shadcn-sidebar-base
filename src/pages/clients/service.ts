import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para Client
export type ClientData = {
	phone: string
	role: number
	company_id?: number
}

export type ClientResponse = {
	id: number
	company_id: number
	phone: string
	role: number
	created_at: string
	updated_at: string
}

// Tipo para a resposta da API de listagem
export type ClientsListResponse = {
	clients: ClientResponse[]
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

class ClientsService {

	// Buscar todos os clientes da empresa
	async getClients(page: number = 1, limit: number = 20): Promise<ClientsListResponse> {
		try {
			// Converter page para offset (page 1 = offset 0)
			const offset = (page - 1) * limit
			
			const response: AxiosResponse<ClientsListResponse> = await axios.get(
				`${BASE_URL}/clients?limit=${limit}&offset=${offset}&company_id=1` // TODO
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
				message: error.response?.data?.message || 'Erro ao buscar clientes',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar um cliente específico
	async getClient(clientId: string): Promise<ClientResponse> {
		try {
			const response: AxiosResponse<ClientResponse> = await axios.get(
				`${BASE_URL}/clients/${clientId}`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Criar novo cliente
	async createClient(data: ClientData): Promise<ClientResponse> {
		try {
			const response: AxiosResponse<ClientResponse> = await axios.post(
				`${BASE_URL}/clients`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao criar cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Atualizar cliente existente
	async updateClient(clientId: string, data: ClientData): Promise<ClientResponse> {
		try {
			const response: AxiosResponse<ClientResponse> = await axios.put(
				`${BASE_URL}/clients/${clientId}`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao atualizar cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Deletar cliente
	async deleteClient(clientId: string): Promise<void> {
		try {
			await axios.delete(
				`${BASE_URL}/clients/${clientId}`
			)
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao deletar cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const clientsService = new ClientsService()
