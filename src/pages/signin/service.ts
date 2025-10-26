import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
	throw new Error('VITE_API_URL environment variable is required')
}

// Tipo de dados para SignIn
export type SignInData = {
	mobile: string
	password: string
	company_id: number
}

// Tipo de resposta da API de autenticação
export type User = {
	id: number
	company_id: number
	name: string
	mobile: string
	role: string
}

export type SignInResponse = {
	user: User
	token: string
}

// Tipo de erro customizado da API
export type ApiError = {
	message: string
	status: number
	details?: any
}


class ApiSignIn {
    static async GetToken({ data }: { data: SignInData }): Promise<SignInResponse> {
        try {
            const response: AxiosResponse<SignInResponse> = await axios.post(
                `${BASE_URL}/login`, 
                data
            )
            return response.data
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Credenciais inválidas',
                status: error.response?.status || 401,
                details: error.response?.data
            }
            throw apiError
        }
    }
}

export default ApiSignIn