import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para LoyaltyAccount
export type LoyaltyAccountData = {
	client_id: number
	current_points?: number
	total_earned?: number
	total_redeemed?: number
	status?: 'active' | 'inactive' | 'suspended'
}

export type LoyaltyAccountResponse = {
	id: number
	client_id: number
	client_name: string
	client_phone: string
	client_address: string
	current_points: number
	total_earned: number
	total_redeemed: number
	status: 'active' | 'inactive' | 'suspended'
	created_at: string
	updated_at: string
}

// Tipo para transações de pontos
export type PointsTransactionData = {
	account_id: number
	type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
	points: number
	description: string
	reference_type?: 'booking' | 'reward' | 'manual'
	reference_id?: number
}

export type PointsTransactionResponse = {
	id: number
	account_id: number
	type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
	points: number
	description: string
	reference_type?: 'booking' | 'reward' | 'manual'
	reference_id?: number
	created_at: string
}

// Tipo para estatísticas de fidelidade
export type LoyaltyStatsResponse = {
	total_accounts: number
	active_accounts: number
	total_points_circulation: number
	points_earned_month: number
	points_redeemed_month: number
	engagement_rate: number
}

// Tipo para a resposta da API de listagem
export type LoyaltyAccountsListResponse = {
	accounts: LoyaltyAccountResponse[]
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

class LoyaltyService {

	// Buscar todas as contas de fidelidade
	async getLoyaltyAccounts(page: number = 1, limit: number = 20): Promise<LoyaltyAccountsListResponse> {
		try {
			// Converter page para offset (page 1 = offset 0)
			const offset = (page - 1) * limit
			
			const response: AxiosResponse<LoyaltyAccountsListResponse> = await axios.get(
				`${BASE_URL}/loyalty/accounts?limit=${limit}&offset=${offset}`
			)
			
			// Garantir que accounts seja sempre um array
			const accounts = response.data?.accounts || []
			
			// Simular resposta com page para compatibilidade
			const responseData = {
				accounts: accounts,
				total: response.data?.total || 0,
				page: page,
				limit: limit
			}
			
			return responseData
		} catch (error: any) {
			console.error('Erro ao buscar contas de fidelidade:', error)
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar contas de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar uma conta de fidelidade específica
	async getLoyaltyAccount(accountId: string): Promise<LoyaltyAccountResponse> {
		try {
			const response: AxiosResponse<LoyaltyAccountResponse> = await axios.get(
				`${BASE_URL}/loyalty/accounts/${accountId}`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar conta de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Criar nova conta de fidelidade
	async createLoyaltyAccount(data: LoyaltyAccountData): Promise<LoyaltyAccountResponse> {
		try {
			const response: AxiosResponse<LoyaltyAccountResponse> = await axios.post(
				`${BASE_URL}/loyalty/accounts`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao criar conta de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Atualizar conta de fidelidade existente
	async updateLoyaltyAccount(accountId: string, data: Partial<LoyaltyAccountData>): Promise<LoyaltyAccountResponse> {
		try {
			const response: AxiosResponse<LoyaltyAccountResponse> = await axios.put(
				`${BASE_URL}/loyalty/accounts/${accountId}`,
				data
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao atualizar conta de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Adicionar pontos a uma conta
	async addPoints(accountId: string, points: number, description: string): Promise<PointsTransactionResponse> {
		try {
			const response: AxiosResponse<PointsTransactionResponse> = await axios.post(
				`${BASE_URL}/loyalty/points/earn`,
				{
					account_id: parseInt(accountId),
					points,
					description,
					type: 'earned'
				}
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao adicionar pontos',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Resgatar pontos de uma conta
	async redeemPoints(accountId: string, points: number, description: string): Promise<PointsTransactionResponse> {
		try {
			const response: AxiosResponse<PointsTransactionResponse> = await axios.post(
				`${BASE_URL}/loyalty/points/redeem`,
				{
					account_id: parseInt(accountId),
					points,
					description,
					type: 'redeemed'
				}
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao resgatar pontos',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar histórico de transações de uma conta (simulado por enquanto)
	async getPointsHistory(accountId: string): Promise<PointsTransactionResponse[]> {
		try {
			// Como não existe endpoint de histórico, vamos simular dados
			// Em produção, isso seria implementado no backend
			const mockHistory: PointsTransactionResponse[] = [
				{
					id: 1,
					account_id: parseInt(accountId),
					type: 'earned',
					points: 150,
					description: 'Agendamento #123 - Lavagem Completa',
					reference_type: 'booking',
					reference_id: 123,
					created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 dias atrás
				},
				{
					id: 2,
					account_id: parseInt(accountId),
					type: 'redeemed',
					points: 100,
					description: 'Resgate de recompensa - Desconto 10%',
					reference_type: 'reward',
					reference_id: 1,
					created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 dias atrás
				},
				{
					id: 3,
					account_id: parseInt(accountId),
					type: 'earned',
					points: 200,
					description: 'Agendamento #124 - Lavagem + Enceramento',
					reference_type: 'booking',
					reference_id: 124,
					created_at: new Date(Date.now() - 86400000 * 7).toISOString() // 7 dias atrás
				}
			]
			
			return mockHistory
		} catch (error: any) {
			console.error('Erro ao buscar histórico:', error)
			const apiError: ApiError = {
				message: 'Erro ao buscar histórico de pontos',
				status: 500,
				details: error
			}
			throw apiError
		}
	}

	// Calcular estatísticas baseado nas contas existentes
	async getLoyaltyStats(): Promise<LoyaltyStatsResponse> {
		try {
			// Buscar todas as contas para calcular estatísticas
			const accountsResponse = await this.getLoyaltyAccounts(1, 1000) // Buscar muitas contas
			const accounts = accountsResponse.accounts || []
			
			// Calcular estatísticas manualmente
			const totalAccounts = accounts.length
			const activeAccounts = accounts.filter(acc => acc.status === 'active').length
			const totalPointsCirculation = accounts.reduce((sum, acc) => sum + acc.current_points, 0)
			const totalEarned = accounts.reduce((sum, acc) => sum + acc.total_earned, 0)
			const totalRedeemed = accounts.reduce((sum, acc) => sum + acc.total_redeemed, 0)
			
			// Simular dados mensais (30% do total como estimativa)
			const pointsEarnedMonth = Math.floor(totalEarned * 0.3)
			const pointsRedeemedMonth = Math.floor(totalRedeemed * 0.3)
			
			// Calcular engajamento (contas com pontos > 0)
			const engagedAccounts = accounts.filter(acc => acc.current_points > 0).length
			const engagementRate = totalAccounts > 0 ? (engagedAccounts / totalAccounts) * 100 : 0
			
			const stats: LoyaltyStatsResponse = {
				total_accounts: totalAccounts,
				active_accounts: activeAccounts,
				total_points_circulation: totalPointsCirculation,
				points_earned_month: pointsEarnedMonth,
				points_redeemed_month: pointsRedeemedMonth,
				engagement_rate: engagementRate
			}
			
			return stats
		} catch (error: any) {
			console.error('Erro ao calcular estatísticas:', error)
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao calcular estatísticas de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Buscar conta de fidelidade por cliente
	async getLoyaltyAccountByClient(clientId: string): Promise<LoyaltyAccountResponse> {
		try {
			const response: AxiosResponse<LoyaltyAccountResponse> = await axios.get(
				`${BASE_URL}/loyalty/clients/${clientId}/account`
			)
			return response.data
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao buscar conta de fidelidade do cliente',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}

	// Deletar conta de fidelidade
	async deleteLoyaltyAccount(accountId: string): Promise<void> {
		try {
			await axios.delete(
				`${BASE_URL}/loyalty/accounts/${accountId}`
			)
		} catch (error: any) {
			const apiError: ApiError = {
				message: error.response?.data?.message || 'Erro ao deletar conta de fidelidade',
				status: error.response?.status || 500,
				details: error.response?.data
			}
			throw apiError
		}
	}
}

export const loyaltyService = new LoyaltyService()
