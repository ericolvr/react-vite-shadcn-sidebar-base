import axios, { type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
    throw new Error('VITE_API_URL environment variable is required')
}

// Tipos para Booking
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type BookingService = {
    id: number
    name: string
    duration: number
}

export type Booking = {
    id: number
    company_id: number
    client_id: number
    client_phone: string
    vehicle_plate: string
    services: BookingService[]
    status: BookingStatus
    scheduled_at?: string  // Data/hora agendada
    started_at?: string    // Data/hora de início
    completed_at?: string  // Data/hora de conclusão
    notes?: string
}

// Tipo para configurações da empresa
export type CompanySettingsResponse = {
    id: number
    company_id: number
    start_work_weekday: string    // "08:00:00"
    end_work_weekday: string      // "18:00:00"
    start_work_weekend: string    // "08:00:00"
    end_work_weekend: string      // "17:00:00"
    site: string
    email: string
    phone: string
}

// Tipos para Schedule API
export type ScheduleSlot = {
    start_time: string    // "2025-11-03T08:00:00Z"
    end_time: string      // "2025-11-03T08:30:00Z"
    available: boolean
    booking_id?: number   // ID do booking (quando ocupado)
    client_name?: string  // Nome do cliente (quando ocupado)
    service_names?: string[] // Lista de serviços (quando ocupado)
}

export type ScheduleResponse = {
    date: string          // "2025-11-03T00:00:00Z"
    company_id: number
    schedule: ScheduleSlot[]
}

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

export type BookingsListResponse = {
    bookings: Booking[]
    total: number
    page: number
    limit: number
}

export type CreateBookingRequest = {
    company_id: number
    client_id: number
    vehicle_id: number
    service_ids: number[]
    package_id?: number
    scheduled_at: string // ISO string format
    status: string // Status do booking (ex: 'created')
    notes?: string
}

// Tipo de erro customizado da API
export type ApiError = {
    message: string
    status: number
    details?: any
}

class BookingsListService {

    // Buscar todos os agendamentos com filtros
    async getBookings(
        companyId: number,
        page: number = 1, 
        limit: number = 20,
        search?: string,
        status?: BookingStatus,
        date?: string // Formato: YYYY-MM-DD
    ): Promise<BookingsListResponse> {
        try {
            const params = new URLSearchParams({
                company_id: companyId.toString(),
                page: page.toString(),
                limit: limit.toString()
            })

            if (search) {
                params.append('search', search)
            }

            if (status) {
                params.append('status', status)
            }

            if (date) {
                params.append('date', date)
            }

            const response: AxiosResponse<BookingsListResponse> = await axios.get(
                `${BASE_URL}/bookings?${params.toString()}`
            )

            return response.data
        } catch (error: any) {
            console.error('Erro ao buscar agendamentos da API:', error)
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao buscar agendamentos',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Buscar configurações da empresa
    async getCompanySettings(companyId: number = 1): Promise<CompanySettings> {
        try {
            const response: AxiosResponse<CompanySettings> = await axios.get(
                `${BASE_URL}/companies/${companyId}/settings`
            )

            return response.data
        } catch (error: any) {
            console.warn('API de configurações não encontrada, usando configurações padrão:', error.message)
            
            // Retornar configurações padrão se a API não estiver disponível
            return {
                id: 1,
                company_id: companyId,
                weekday_start: '08:00',
                weekday_end: '18:00',
                weekend_start: '09:00',
                weekend_end: '17:00',
                slot_duration: 15,
                advance_booking_days: 7,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        }
    }

    // Buscar agendamento por ID
    async getBookingById(id: number): Promise<Booking> {
        try {
            const response: AxiosResponse<Booking> = await axios.get(
                `${BASE_URL}/bookings/${id}`
            )

            return response.data
        } catch (error: any) {
            console.error('Erro ao buscar agendamento:', error)
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao buscar agendamento',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Atualizar status do agendamento
    async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
        try {
            const response: AxiosResponse<Booking> = await axios.patch(
                `${BASE_URL}/bookings/${id}/status`,
                { status }
            )

            return response.data
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao atualizar status do agendamento',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Cancelar agendamento
    async cancelBooking(id: number, reason?: string): Promise<void> {
        try {
            await axios.delete(`${BASE_URL}/bookings/${id}`, {
                data: { reason }
            })
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao cancelar agendamento',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Deletar booking
    async deleteBooking(bookingId: string): Promise<void> {
        try {
            await axios.delete(`${BASE_URL}/bookings/${bookingId}`)
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao deletar agendamento',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Criar novo agendamento
    async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
        try {
            console.log('📝 Criando booking com dados:', bookingData)
            
            const response: AxiosResponse<Booking> = await axios.post(
                `${BASE_URL}/bookings`,
                bookingData
            )
            
            console.log('✅ Booking criado com sucesso:', response.data)
            return response.data
        } catch (error: any) {
            console.error('💥 Erro ao criar booking:', error)
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao criar agendamento',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Buscar slots disponíveis
    async getAvailableSlots(companyId: number, date: string, serviceIds: number[]): Promise<string[]> {
        try {
            const serviceIdsParam = serviceIds.join(',')
            const response: AxiosResponse<any> = await axios.get(
                `${BASE_URL}/availability/slots?company_id=${companyId}&date=${date}&service_ids=${serviceIdsParam}`
            )
            
            // Log para debug
            console.log('🕐 Resposta da API slots:', response.data)
            
            // Extrair slots da resposta (pode ser array direto ou dentro de propriedade)
            let slots = response.data.available_slots || response.data || []
            
            // Se for array de objetos, extrair apenas os horários
            if (Array.isArray(slots) && slots.length > 0 && typeof slots[0] === 'object') {
                slots = slots.map(slot => slot.time || slot.start_time || slot.hour || slot.toString())
            }
            
            return slots.filter((slot: any) => typeof slot === 'string')
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao buscar slots disponíveis',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // Buscar schedule completo do dia
    async getSchedule(companyId: number, date: string): Promise<ScheduleResponse> {
        try {
            console.log(`📅 Buscando schedule para company_id: ${companyId}, date: ${date}`)
            const response: AxiosResponse<ScheduleResponse> = await axios.get(
                `${BASE_URL}/availability/schedule?company_id=${companyId}&date=${date}`
            )
            
            console.log('📊 Resposta da API schedule:', response.data)
            console.log(`🕐 Total de slots encontrados: ${response.data.schedule.length}`)
            console.log(`✅ Slots disponíveis: ${response.data.schedule.filter(slot => slot.available).length}`)
            
            return response.data
        } catch (error: any) {
            console.error('❌ Erro ao buscar schedule:', error)
            const apiError: ApiError = {
                message: error.response?.data?.message || 'Erro ao buscar schedule',
                status: error.response?.status || 500,
                details: error.response?.data
            }
            throw apiError
        }
    }

    // DADOS SIMULADOS (para demonstração)
    private getMockBookings(
        page: number, 
        limit: number, 
        search?: string, 
        status?: BookingStatus
    ): BookingsListResponse {
        const allBookings: Booking[] = [
            {
                id: 1,
                company_id: 1,
                client_id: 1,
                client_name: 'João Silva',
                client_phone: '(11) 99999-1111',
                client_email: 'joao@email.com',
                vehicle_id: 1,
                vehicle_plate: 'ABC-1234',
                vehicle_model: 'Honda Civic',
                vehicle_color: 'Branco',
                service_id: 1,
                service_name: 'Lavagem Completa',
                service_price: 25.00,
                service_duration: 45,
                service_points: 25,
                scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Amanhã
                status: 'confirmed',
                notes: 'Cliente preferencial',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                company_id: 1,
                client_id: 2,
                client_name: 'Maria Santos',
                client_phone: '(11) 88888-2222',
                vehicle_id: 2,
                vehicle_plate: 'XYZ-5678',
                vehicle_model: 'Toyota Corolla',
                vehicle_color: 'Prata',
                service_id: 2,
                service_name: 'Lavagem + Enceramento',
                service_price: 45.00,
                service_duration: 60,
                service_points: 45,
                scheduled_at: new Date(Date.now() + 172800000).toISOString(), // Depois de amanhã
                status: 'pending',
                created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
                updated_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 3,
                company_id: 1,
                client_id: 3,
                client_name: 'Pedro Oliveira',
                client_phone: '(11) 77777-3333',
                vehicle_id: 3,
                vehicle_plate: 'DEF-9012',
                vehicle_model: 'Volkswagen Gol',
                vehicle_color: 'Azul',
                service_id: 1,
                service_name: 'Lavagem Completa',
                service_price: 25.00,
                service_duration: 45,
                service_points: 25,
                scheduled_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
                status: 'completed',
                notes: 'Serviço realizado com sucesso',
                created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
                updated_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 4,
                company_id: 1,
                client_id: 4,
                client_name: 'Ana Costa',
                client_phone: '(11) 66666-4444',
                vehicle_id: 4,
                vehicle_plate: 'GHI-3456',
                vehicle_model: 'Ford Ka',
                vehicle_color: 'Vermelho',
                service_id: 3,
                service_name: 'Lavagem Simples',
                service_price: 15.00,
                service_duration: 30,
                service_points: 15,
                scheduled_at: new Date().toISOString(), // Hoje
                status: 'in_progress',
                created_at: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
                updated_at: new Date(Date.now() - 1800000).toISOString() // 30 min atrás
            },
            {
                id: 5,
                company_id: 1,
                client_id: 5,
                client_name: 'Carlos Ferreira',
                client_phone: '(11) 55555-5555',
                vehicle_id: 5,
                vehicle_plate: 'JKL-7890',
                vehicle_model: 'Chevrolet Onix',
                vehicle_color: 'Preto',
                service_id: 2,
                service_name: 'Lavagem + Enceramento',
                service_price: 45.00,
                service_duration: 60,
                service_points: 45,
                scheduled_at: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
                status: 'cancelled',
                notes: 'Cliente cancelou por motivos pessoais',
                created_at: new Date(Date.now() - 345600000).toISOString(), // 4 dias atrás
                updated_at: new Date(Date.now() - 259200000).toISOString()
            }
        ]

        // Aplicar filtros
        let filteredBookings = allBookings

        if (search) {
            const searchLower = search.toLowerCase()
            filteredBookings = filteredBookings.filter(booking => 
                booking.client_name.toLowerCase().includes(searchLower) ||
                booking.client_phone.includes(search) ||
                booking.vehicle_plate.toLowerCase().includes(searchLower)
            )
        }

        if (status) {
            filteredBookings = filteredBookings.filter(booking => booking.status === status)
        }

        // Aplicar paginação
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

        return {
            bookings: paginatedBookings,
            total: filteredBookings.length,
            page,
            limit
        }
    }

    // Buscar configurações da empresa
    async getCompanySettings(companyId: number): Promise<CompanySettingsResponse> {
        try {
            const response: AxiosResponse<CompanySettingsResponse> = await axios.get(
                `${BASE_URL}/companies/${companyId}/settings`
            )
            return response.data
        } catch (error: any) {
            console.error('Erro ao buscar configurações da empresa:', error)
            throw new Error(error.response?.data?.message || 'Erro ao buscar configurações da empresa')
        }
    }

    private getMockBookingById(id: number): Booking {
        const mockBookings = this.getMockBookings(1, 100).bookings
        const booking = mockBookings.find(b => b.id === id)
        
        if (!booking) {
            throw new Error(`Agendamento com ID ${id} não encontrado`)
        }
        
        return booking
    }
}

export const bookingsListService = new BookingsListService()
