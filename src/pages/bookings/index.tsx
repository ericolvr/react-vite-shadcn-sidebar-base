import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
    Calendar, 
    CalendarClock,
    User, 
    Car, 
    Phone, 
    MapPin,
    Plus,
    Loader2,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'
import { servicesService, type ServiceResponse } from '../services/service'
import { bookingsListService, type CreateBookingRequest, type ScheduleSlot } from './list-service'
import { type Vehicle } from './components/vehicle-service'
import { useAuth } from '@/contexts/context'
import AddBookings from './components/AddBookings'

type BookingStatus = 'reserved' | 'completed' | 'cancelled'

type TimeSlot = {
    time: string
    booking?: Booking
    isStart?: boolean  // Se é o início do serviço
    isContinuation?: boolean  // Se é continuação do serviço
}

export function Bookings() {
    const navigate = useNavigate()
    const { getUserData, isLoggedIn, isLoading: authLoading } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [companySettings, setCompanySettings] = useState<CompanySettingsResponse | null>(null)
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)
    const [services, setServices] = useState<ServiceResponse[]>([])
    const [selectedService, setSelectedService] = useState<string>('')
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [isScheduleOpen, setIsScheduleOpen] = useState(true)
    const [modalSelectedDate, setModalSelectedDate] = useState<Date>(() => {
        // Garantir que a data inicial seja sempre hoje ou futura
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
    })
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })

    // Gerar próximos 7 dias
    const generateWeekDays = (): Date[] => {
        const days: Date[] = []
        const today = new Date()
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            days.push(date)
        }
        
        return days
    }

    // Buscar configurações da empresa e schedule do dia
    const loadSchedule = async (date: Date) => {
        try {
            setLoading(true)
            
            // Verificar se o usuário está logado
            if (!isLoggedIn()) {
                console.error('❌ Bookings: Usuário não está logado')
                return
            }
            
            const userData = getUserData()
            if (!userData.company_id) {
                console.error('❌ Bookings: Company ID não encontrado')
                return
            }
            
            // Formatar data para API (YYYY-MM-DD)
            const dateString = date.toISOString().split('T')[0]
            
            console.log(`📅 Bookings: Carregando dados para ${dateString}`)
            
            // Buscar configurações da empresa, schedule e bookings em paralelo
            const [companySettings, scheduleData, bookingsData] = await Promise.all([
                bookingsListService.getCompanySettings(userData.company_id),
                bookingsListService.getSchedule(userData.company_id, dateString),
                bookingsListService.getBookings(userData.company_id, 1, 100, undefined, undefined, dateString)
            ])
            
            console.log('⚙️ Bookings: Configurações da empresa:', companySettings)
            console.log('📊 Bookings: Schedule carregado:', scheduleData)
            console.log('📋 Bookings: Agendamentos carregados:', bookingsData)
            
            setCompanySettings(companySettings)
            setSchedule(scheduleData.schedule)
            setBookings(bookingsData.bookings)
            
            // Gerar slots baseados nas configurações da empresa
            const allSlots = generateSlotsFromSettings(companySettings, date)
            
            // Mapear com dados do schedule e bookings completos
            const slotsWithAvailability = mapSlotsWithSchedule(allSlots, scheduleData.schedule, bookingsData.bookings)
            console.log('🎯 setTimeSlots chamado com:', slotsWithAvailability.length, 'slots')
            setTimeSlots(slotsWithAvailability)
            
        } catch (error) {
            console.error('❌ Erro ao carregar schedule:', error)
            setError('Erro ao carregar horários')
        } finally {
            setLoading(false)
        }
    }

    // Gerar slots baseados nas configurações da empresa
    const generateSlotsFromSettings = (settings: any, date: Date): string[] => {
        console.log('🏗️ generateSlotsFromSettings chamada com:', { settings, date })
        
        const slots: string[] = []
        const isWeekend = date.getDay() === 0 || date.getDay() === 6 // 0 = Domingo, 6 = Sábado
        
        console.log('📅 É fim de semana?', isWeekend)
        
        // Usar configurações da empresa
        let startTime: string
        let endTime: string
        
        if (settings) {
            console.log('⚙️ Usando configurações da empresa:', settings)
            if (isWeekend) {
                // Converter "08:00:00" para "08:00"
                startTime = settings.start_work_weekend?.substring(0, 5) || '08:00'
                endTime = settings.end_work_weekend?.substring(0, 5) || '17:00'
            } else {
                // Converter "08:00:00" para "08:00"
                startTime = settings.start_work_weekday?.substring(0, 5) || '08:00'
                endTime = settings.end_work_weekday?.substring(0, 5) || '18:00'
            }
        } else {
            console.log('⚠️ Usando horários padrão (sem configurações)')
            // Horários padrão se não tiver configurações
            startTime = isWeekend ? '08:00' : '08:00'
            endTime = isWeekend ? '17:00' : '18:00'
        }
        
        console.log('🕐 Horários definidos:', { startTime, endTime })
        
        // Gerar slots de 30 minutos (conforme API)
        const slotDuration = 30
        
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)
        
        const startTotalMinutes = startHour * 60 + startMinute
        const endTotalMinutes = endHour * 60 + endMinute
        
        for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
            const hour = Math.floor(minutes / 60)
            const minute = minutes % 60
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            slots.push(timeString)
        }
        
        console.log(`🕐 Slots gerados para ${isWeekend ? 'fim de semana' : 'dia de semana'} (${startTime} - ${endTime}):`, slots.length, 'slots')
        console.log('📋 Lista de slots:', slots)
        return slots
    }

    // Mapear slots gerados com dados do schedule da API e bookings completos
    const mapSlotsWithSchedule = (generatedSlots: string[], scheduleSlots: ScheduleSlot[], fullBookings: any[] = []): TimeSlot[] => {
        console.log('🔗 mapSlotsWithSchedule chamada com:', { 
            generatedSlotsCount: generatedSlots.length, 
            scheduleSlotsCount: scheduleSlots.length,
            fullBookingsCount: fullBookings.length
        })
        console.log('📋 Generated slots:', generatedSlots)
        console.log('📋 Schedule slots:', scheduleSlots)
        console.log('📋 Full bookings:', fullBookings)
        
        const mappedSlots = generatedSlots.map(timeSlot => {
            // Procurar slot correspondente no schedule da API
            const scheduleSlot = scheduleSlots.find(apiSlot => {
                const apiTime = new Date(apiSlot.start_time).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                })
                return apiTime === timeSlot
            })
            
            // Criar objeto de booking se o slot estiver ocupado
            let booking = undefined
            if (scheduleSlot && !scheduleSlot.available && scheduleSlot.booking_id) {
                // Procurar dados completos do booking na API /bookings
                const fullBooking = fullBookings.find(b => b.id === scheduleSlot.booking_id)
                
                if (fullBooking) {
                    // Usar dados completos da API /bookings
                    booking = {
                        id: fullBooking.id,
                        vehicle_plate: fullBooking.vehicle_plate,
                        services: fullBooking.services || [],
                        status: fullBooking.status as BookingStatus,
                        client_name: fullBooking.client_name,
                        client_phone: fullBooking.client_phone,
                        scheduled_at: fullBooking.scheduled_at,
                        notes: fullBooking.notes,
                        service_names: fullBooking.services?.map((s: any) => s.name) || []
                    }
                } else {
                    // Fallback para dados do schedule se não encontrar na API /bookings
                    booking = {
                        id: scheduleSlot.booking_id,
                        vehicle_plate: 'N/A',
                        services: scheduleSlot.service_names?.map(name => ({ name })) || [],
                        status: 'reserved' as BookingStatus,
                        client_name: scheduleSlot.client_name || 'Cliente não encontrado',
                        service_names: scheduleSlot.service_names || []
                    }
                }
            }

            return {
                time: timeSlot,
                booking: booking,
                isStart: false,
                isContinuation: false,
                available: scheduleSlot?.available ?? true // Disponível por padrão se não encontrar na API
            } as TimeSlot & { available: boolean }
        })
        
        console.log('✅ Slots mapeados:', mappedSlots.length, mappedSlots)
        return mappedSlots
    }

    // Gerar slots de tempo baseado nas configurações da empresa e data selecionada
    const generateTimeSlots = (settings: CompanySettingsResponse | null, date: Date): string[] => {
        const slots: string[] = []
        const isWeekend = date.getDay() === 0 || date.getDay() === 6 // 0 = Domingo, 6 = Sábado
        
        // Usar horários padrão se não tiver configurações
        const startTime = isWeekend ? '09:00' : '08:00'
        const endTime = isWeekend ? '17:00' : '18:00'
        const slotDuration = 15 // 15 minutos por slot
        
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)
        
        const startTotalMinutes = startHour * 60 + startMinute
        const endTotalMinutes = endHour * 60 + endMinute
        
        for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slotDuration) {
            const hour = Math.floor(minutes / 60)
            const minute = minutes % 60
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            slots.push(timeString)
        }
        
        return slots
    }

    // Converter horário string para minutos
    const timeToMinutes = (timeString: string): number => {
        const [hours, minutes] = timeString.split(':').map(Number)
        return hours * 60 + minutes
    }

    // Converter minutos para horário string
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    // Mapear bookings para slots de tempo (considerando duração)
    const mapBookingsToTimeSlots = (bookings: Booking[], timeSlots: string[]): TimeSlot[] => {
        return timeSlots.map(time => {
            // Encontrar booking que ocupa este horário (início ou durante o serviço)
            const booking = bookings.find(b => {
                const bookingDateTime = b.started_at || b.scheduled_at
                if (!bookingDateTime) return false

                // Extrair horário diretamente da string sem conversão de timezone
                const bookingTime = bookingDateTime.includes('T') 
                    ? bookingDateTime.split('T')[1].substring(0, 5) // "12:00" de "2025-10-28T12:00:00Z"
                    : bookingDateTime.substring(11, 16) // "12:00" de "2025-10-28 12:00:00"
                
                // Calcular duração total dos serviços
                const totalDuration = b.services.reduce((total: number, service: any) => total + service.duration, 0)
                
                // Converter horários para minutos para facilitar cálculos
                const slotMinutes = timeToMinutes(time)
                const bookingStartMinutes = timeToMinutes(bookingTime)
                const bookingEndMinutes = bookingStartMinutes + totalDuration

                // Verificar se o slot atual está dentro do período do booking
                const isOccupied = slotMinutes >= bookingStartMinutes && slotMinutes < bookingEndMinutes

                return isOccupied
            })
            
            // Determinar se é início ou continuação
            let isStart = false
            let isContinuation = false

            if (booking) {
                const bookingDateTime = booking.started_at || booking.scheduled_at!
                // Usar a mesma lógica de extração de horário
                const bookingTime = bookingDateTime.includes('T') 
                    ? bookingDateTime.split('T')[1].substring(0, 5) // "12:00" de "2025-10-28T12:00:00Z"
                    : bookingDateTime.substring(11, 16) // "12:00" de "2025-10-28 12:00:00"
                
                isStart = time === bookingTime
                isContinuation = time !== bookingTime
            }

            return {
                time,
                booking,
                isStart,
                isContinuation
            }
        })
    }

    const loadData = async (isRefresh = false) => {
        try {
            // Só mostrar loading na primeira carga, não no refresh automático
            if (!isRefresh) {
                setLoading(true)
            }
            setError(null)
            
            // Gerar slots de tempo para a data selecionada (sem depender de configurações)
            const slots = generateTimeSlots(null, selectedDate)
            
            // Formatar data selecionada para API (YYYY-MM-DD)
            const dateString = selectedDate.toISOString().split('T')[0]
            
            // Verificar se o usuário está logado
            if (!isLoggedIn()) {
                console.error('Bookings: Usuário não está logado')
                return
            }
            
            const userData = getUserData()
            if (!userData.company_id) {
                throw new Error('Company ID não encontrado')
            }
            
            // Carregar bookings filtrados por data
            const response = await bookingsListService.getBookings(
                userData.company_id,
                pagination.page, 
                pagination.limit,
                undefined, // search
                undefined, // status
                dateString // date
            )
            
            console.log('📊 BookingsList: Resposta da API:', response)
            
            // Verificar se a resposta tem a estrutura esperada
            if (!response || !response.bookings || !Array.isArray(response.bookings)) {
                console.warn('⚠️ BookingsList: Resposta da API inválida:', response)
                setBookings([])
                setTimeSlots(slots)
                return
            }
            
            // FILTRO: Manter apenas agendamentos da data selecionada
            const bookingsForSelectedDate = response.bookings.filter((booking: any) => {
                const bookingDateTime = booking.scheduled_at || booking.started_at
                if (!bookingDateTime) return false
                
                // Extrair apenas a data (YYYY-MM-DD)
                const bookingDate = bookingDateTime.split('T')[0]
                return bookingDate === dateString
            })
            
            setBookings(bookingsForSelectedDate)
            setPagination(prev => ({
                ...prev,
                total: bookingsForSelectedDate.length,
                totalPages: Math.ceil(bookingsForSelectedDate.length / response.limit)
            }))
            
            // Mapear bookings filtrados para slots de tempo
            const timeSlotsWithBookings = mapBookingsToTimeSlots(bookingsForSelectedDate, slots)
            setTimeSlots(timeSlotsWithBookings)
            
        } catch (err: any) {
            console.error('Erro ao carregar dados:', err)
            setError(err.message || 'Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    // Carregar serviços
    const loadServices = async () => {
        console.log('🚀 loadServices INICIADO')
        try {
            // Verificar se o usuário está logado
            if (!isLoggedIn()) {
                console.error('❌ BookingsList: Usuário não está logado')
                return
            }
            
            const userData = getUserData()
            console.log('👤 userData:', userData)
            if (!userData.company_id) {
                console.error('❌ Company ID não encontrado no userData')
                throw new Error('Company ID não encontrado')
            }
            
            console.log('📡 Bookings: Fazendo chamada para servicesService.getServices com company_id:', userData.company_id)
            console.log('📡 Bookings: Parâmetros da chamada - company_id:', userData.company_id, 'limit:', 100)
            const response = await servicesService.getServices(userData.company_id, 1, 100) // page=1, limit=100
            console.log('📊 Bookings: Resposta completa da API:', response)
            console.log('📊 Bookings: response.services tipo:', typeof response.services)
            console.log('📊 Bookings: response.services valor:', response.services)
            console.log('📊 Bookings: Total de serviços recebidos:', response.services?.length || 0)
            
            if (!response.services || response.services.length === 0) {
                console.warn('⚠️ Nenhum serviço retornado da API')
                setServices([])
                return
            }
            
            const activeServices = response.services.filter(service => service.active)
            console.log('📊 Bookings: Serviços ativos filtrados:', activeServices.length)
            console.log('📊 Bookings: Lista de serviços ativos:', activeServices)
            
            setServices(activeServices)
            console.log('✅ setServices executado com', activeServices.length, 'serviços')
        } catch (error) {
            console.error('💥 Erro ao carregar serviços:', error)
        }
    }

    // Buscar slots disponíveis para o serviço selecionado
    const loadAvailableSlots = useCallback(async (serviceId: string) => {
        if (!serviceId || !isNewBookingModalOpen) {
            setAvailableSlots([])
            return
        }

        try {
            // Não mostrar loading para mudanças de data para evitar piscar
            const dateString = modalSelectedDate.toISOString().split('T')[0]
            const companyId = 1 // ID da empresa
            const serviceIds = [parseInt(serviceId)]
            
            const slots = await bookingsListService.getAvailableSlots(companyId, dateString, serviceIds)
            setAvailableSlots(slots)
            
            console.log(`🎯 Slots disponíveis para serviço ${serviceId} em ${dateString}:`, slots)
        } catch (error) {
            console.error('Erro ao carregar slots disponíveis:', error)
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }, [modalSelectedDate, isNewBookingModalOpen])

    // Lidar com mudança de serviço
    const handleServiceChange = (serviceId: string) => {
        setSelectedService(serviceId)
        setSelectedTimeSlot('') // Limpar horário selecionado
        setLoadingSlots(true) // Mostrar loading apenas para mudança de serviço
        loadAvailableSlots(serviceId) // Buscar slots disponíveis
    }

    // Calcular quais slots serão ocupados pelo serviço
    const getOccupiedSlots = (startTime: string, serviceDuration: number): string[] => {
        if (!startTime) return []
        
        const occupiedSlots: string[] = []
        
        // Extrair horário limpo (08:00)
        const cleanStartTime = startTime.includes('T') ? startTime.split('T')[1].substring(0, 5) : startTime
        const [hours, minutes] = cleanStartTime.split(':').map(Number)
        let totalMinutes = hours * 60 + minutes
        
        // Calcular quantos slots de 30min são necessários
        // Para 90min: de 08:00 até 09:30 = 4 slots (08:00, 08:30, 09:00, 09:30)
        // Sempre incluir o slot onde o serviço termina
        const slotsNeeded = Math.floor(serviceDuration / 30) + 1
        
        // Gerar slots ocupados de 30 em 30 minutos
        for (let i = 0; i < slotsNeeded; i++) {
            const slotHours = Math.floor(totalMinutes / 60)
            const slotMinutes = totalMinutes % 60
            const slotTime = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`
            occupiedSlots.push(slotTime)
            totalMinutes += 30 // Incrementar de 30 em 30 minutos
        }
        
        console.log(`🎯 Serviço ${serviceDuration}min iniciando em ${cleanStartTime} ocupará slots:`, occupiedSlots)
        return occupiedSlots
    }

    // Verificar se um slot será ocupado pelo serviço selecionado
    const isSlotOccupied = (slot: string): boolean => {
        if (!selectedTimeSlot || !selectedService) return false
        
        const selectedServiceData = services.find(s => s.id.toString() === selectedService)
        if (!selectedServiceData) return false
        
        const cleanSlot = slot.includes('T') ? slot.split('T')[1].substring(0, 5) : slot
        const cleanSelectedTime = selectedTimeSlot.includes('T') ? selectedTimeSlot.split('T')[1].substring(0, 5) : selectedTimeSlot
        
        const occupiedSlots = getOccupiedSlots(cleanSelectedTime, selectedServiceData.duration)
        return occupiedSlots.includes(cleanSlot)
    }

    // Calcular horário de término do serviço
    const getEndTime = (startTime: string, duration: number): string => {
        const cleanStartTime = startTime.includes('T') ? startTime.split('T')[1].substring(0, 5) : startTime
        const [hours, minutes] = cleanStartTime.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + duration
        const endHours = Math.floor(totalMinutes / 60)
        const endMinutes = totalMinutes % 60
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    }

    // Handler para seleção de horário com fechamento do collapse
    const handleTimeSlotSelection = (slot: string) => {
        console.log('🕐 Selecionando horário:', slot)
        console.log('🕐 Tipo do slot:', typeof slot)
        console.log('🕐 Slot como JSON:', JSON.stringify(slot))
        
        if (selectedTimeSlot === slot) {
            setSelectedTimeSlot('')
            setIsScheduleOpen(true) // Reabrir quando cancelar
        } else {
            setSelectedTimeSlot(slot)
            setIsScheduleOpen(false) // Fechar quando selecionar
        }
    }

    // Organizar horários por período para facilitar visualização
    const organizeSlotsByPeriod = (slots: string[]) => {
        const periods = {
            manha: [] as string[],
            tarde: [] as string[],
            noite: [] as string[]
        }

        slots.forEach(slot => {
            const hour = parseInt(slot.split(':')[0])
            if (hour >= 6 && hour < 12) {
                periods.manha.push(slot)
            } else if (hour >= 12 && hour < 18) {
                periods.tarde.push(slot)
            } else {
                periods.noite.push(slot)
            }
        })

        return periods
    }

    useEffect(() => {
        console.log('🔄 useEffect executado - selectedDate:', selectedDate)
        if (!authLoading) {
            loadData()
            loadServices() // Carregar serviços também
            loadSchedule(selectedDate) // Carregar schedule da data selecionada
        }
    }, [pagination.page, selectedDate, authLoading])

    // Debug: Monitorar mudanças nos timeSlots
    useEffect(() => {
        console.log('🔍 timeSlots atualizados:', timeSlots.length, 'slots')
        console.log('🔍 timeSlots detalhes:', timeSlots)
    }, [timeSlots])

    // Debug: Monitorar mudanças nos services
    useEffect(() => {
        console.log('🔍 services atualizados:', services.length, 'serviços')
        console.log('🔍 services detalhes:', services)
    }, [services])

    // Carregar serviços quando o modal abrir
    useEffect(() => {
        if (isNewBookingModalOpen) {
            console.log('🔄 Modal aberto - carregando serviços...')
            loadServices()
        }
    }, [isNewBookingModalOpen])

    // Recarregar slots quando a data do modal mudar
    useEffect(() => {
        if (selectedService && isNewBookingModalOpen) {
            loadAvailableSlots(selectedService)
            setSelectedTimeSlot('') // Limpar horário selecionado
            setIsScheduleOpen(true) // Reabrir collapse
        }
    }, [modalSelectedDate, selectedService, isNewBookingModalOpen])

    // Auto-refresh a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            loadData(true) // isRefresh = true para não mostrar loading
        }, 30000) // 30 segundos

        // Cleanup do interval quando o componente for desmontado
        return () => {
            clearInterval(interval)
        }
    }, []) // Dependência vazia para executar apenas uma vez

    // Função para criar novo booking
    const handleCreateBooking = async () => {
        if (!selectedVehicle || !selectedService || !selectedTimeSlot || !modalSelectedDate) {
            alert('Por favor, preencha todos os campos obrigatórios')
            return
        }

        try {
            
            // Combinar data + horário de forma mais segura
            const scheduledDateTime = new Date(modalSelectedDate)
            
            // Verificar se a data é válida
            if (isNaN(scheduledDateTime.getTime())) {
                throw new Error('Data inválida')
            }
            
            // Limpar e validar horário
            let cleanTimeSlot = selectedTimeSlot.trim()
            
            // Se o horário está no formato ISO (2025-10-27T08:00:00Z), extrair apenas a parte do horário
            if (cleanTimeSlot.includes('T')) {
                // CORREÇÃO: Extrair horário diretamente da string ISO sem conversão de timezone
                const timePart = cleanTimeSlot.split('T')[1].split('Z')[0] // "16:00:00"
                cleanTimeSlot = timePart.substring(0, 5) // "16:00"
            }
            
            // Parsear horário
            const timeParts = cleanTimeSlot.split(':')
            
            if (timeParts.length !== 2) {
                throw new Error(`Formato de horário inválido: esperado HH:MM, recebido: "${cleanTimeSlot}"`)
            }
            
            const hours = parseInt(timeParts[0], 10)
            const minutes = parseInt(timeParts[1], 10)
            
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                throw new Error('Horário inválido')
            }
            
            scheduledDateTime.setHours(hours, minutes, 0, 0)
            
            
            // NOVA ABORDAGEM: Enviar horário local com timezone em vez de UTC
            // Isso evita problemas de sincronização entre frontend e backend
            
            // Detectar timezone automaticamente
            const offset = scheduledDateTime.getTimezoneOffset()
            const offsetHours = Math.floor(Math.abs(offset) / 60)
            const offsetMinutes = Math.abs(offset) % 60
            const offsetSign = offset > 0 ? '-' : '+'
            const timezoneString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`
            
            // Construir timestamp com timezone local usando os valores corretos do scheduledDateTime
            const year = scheduledDateTime.getFullYear()
            const month = String(scheduledDateTime.getMonth() + 1).padStart(2, '0')
            const day = String(scheduledDateTime.getDate()).padStart(2, '0')
            const hourStr = String(scheduledDateTime.getHours()).padStart(2, '0')
            const minuteStr = String(scheduledDateTime.getMinutes()).padStart(2, '0')
            
            
            // Formato: YYYY-MM-DDTHH:MM:SS-03:00 (com timezone local)
            const scheduledAtISO = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00${timezoneString}`
            

            const bookingData: CreateBookingRequest = {
                company_id: selectedVehicle.company_id,
                client_id: selectedVehicle.client_id,
                vehicle_id: selectedVehicle.id,
                service_ids: [parseInt(selectedService)],
                scheduled_at: scheduledAtISO,
                status: 'created',
                notes: ""
            }


            const newBooking = await bookingsListService.createBooking(bookingData)
            
            
            // Fechar modal e limpar estados
            setIsNewBookingModalOpen(false)
            setSelectedService('')
            setSelectedTimeSlot('')
            setSelectedVehicle(null)
            setAvailableSlots([])
            
            // Recarregar lista de bookings
            loadData()
            
        } catch (error: any) {
            console.error('💥 Erro ao criar booking:', error)
            alert(`Erro ao criar agendamento: ${error.message}`)
        }
    }

    const getStatusColor = (status: BookingStatus): string => {
        switch (status) {
            case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusLabel = (status: BookingStatus): string => {
        switch (status) {
            case 'reserved': return 'Agendado'
            case 'completed': return 'Finalizado'
            case 'cancelled': return 'Cancelado'
            default: return status
        }
    }

    const handleRefresh = () => {
        loadData()
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    if (loading && bookings.length === 0) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='bg-white'>
                    <Header 
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Agendamentos' }
                        ]}
                    />
                    <div className='flex items-center justify-center h-64'>
                        <Loader2 className='h-8 w-8 animate-spin' />
                        <span className='ml-2 text-lg'>Carregando agendamentos...</span>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (error) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='bg-white'>
                    <Header 
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Agendamentos' }
                        ]}
                    />
                    <div className='flex flex-col items-center justify-center h-64'>
                        <p className='text-red-500 text-lg mb-4'>{error}</p>
                        <Button onClick={handleRefresh} className='bg-[#317CE5] hover:bg-[#2563eb]'>
                            Tentar Novamente
                        </Button>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='bg-white'>
                <Header 
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Agendamentos' }
                    ]}
                />
                <div className='flex flex-1 flex-col gap-6 mx-8 pt-0 mt-10 mb-8'>
                    
                    {/* Seletor de Dias da Semana com Botão Novo Agendamento */}
                    <div className='flex justify-between items-center gap-4'>
                        {/* Dias da semana à esquerda */}
                        <div className='flex gap-2 overflow-x-auto pb-2 flex-1'>
                            {generateWeekDays().map((date, index) => {
                                const isSelected = selectedDate.toDateString() === date.toDateString()
                                const isToday = new Date().toDateString() === date.toDateString()
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(date)}
                                        className={`
                                            flex flex-col items-center justify-center px-4 py-3 rounded-lg border transition-all font-medium text-sm min-w-[80px]
                                            ${isSelected 
                                                ? 'bg-gradient-to-r from-[#8E30F4] to-[#4645F8] hover:from-[#7C2BD9] hover:to-[#3B3FE6] text-white' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                            }
                                            ${isToday && !isSelected 
                                                ? 'ring-2 ring-[#317CE5] ring-opacity-50' 
                                                : ''
                                            }
                                        `}
                                    >
                                        <span className='text-xs opacity-75'>
                                            {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </span>
                                        <span className='text-lg font-bold'>
                                            {date.getDate()}
                                        </span>
                                        <span className='text-xs opacity-75'>
                                            {date.toLocaleDateString('pt-BR', { month: 'short' })}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                        
                        {/* Botão Novo Agendamento à direita */}
                        <Button 
                            onClick={() => setIsNewBookingModalOpen(true)} 
                            className='bg-gradient-to-r from-[#8E30F4] to-[#4645F8] hover:from-[#7C2BD9] hover:to-[#3B3FE6] text-white px-6 h-[60px]'
                        >
                            <Calendar />
                                Agendar
                        </Button>
                    </div>

                    <div className='bg-white rounded-md overflow-hidden border border-[#EFEFEF]'>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='h-[60px] bg-[#F9F9F9]'>
                                    <tr>
                                        <th className='text-left px-6 py-3 text-black text-[12px] font-bold border-b border-gray-100'>
                                            <div className='flex items-center gap-2'>
                                                HORÁRIO
                                            </div>
                                        </th>
                                        <th className='text-left px-6 py-3 text-black text-[12px] font-bold border-b border-gray-100'>
                                            <div className='flex items-center gap-2'>
                                                VEÍCULO
                                            </div>
                                        </th>
                                        <th className='text-left px-6 py-3 text-black text-[12px] font-bold border-b border-gray-100'>
                                            <div className='flex items-center gap-2'>
                                                SERVIÇO
                                            </div>
                                        </th>
                                        <th className='text-left px-6 py-3 text-black text-[12px] font-bold border-b border-gray-100'>
                                            STATUS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {timeSlots.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className='px-6 py-8 text-center text-gray-500'>
                                                Nenhum horário disponível para esta data
                                            </td>
                                        </tr>
                                    )}
                                    {timeSlots.map((slot, index) => {
                                        const slotWithAvailability = slot as TimeSlot & { available: boolean }
                                        return (
                                            <tr key={index} className='transition-colors hover:bg-gray-50'>
                                                {/* Horário */}
                                                <td className='px-6 py-3'>
                                                    <span className='font-semibold text-black text-[14.5px]'>
                                                        {slot.time}
                                                    </span>
                                                </td>

                                                {/* Placa */}
                                                <td className='px-6 py-3'>
                                                    {slot.booking ? (
                                                        <div>
                                                            <span className='font-semibold text-black text-[14.5px]'>
                                                                {slot.booking.vehicle_plate}
                                                            </span>
                                                            {(slot.booking as any).client_phone && (
                                                                <div className='text-xs text-gray-500'>
                                                                    {(slot.booking as any).client_phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className='text-gray-400'>-</span>
                                                    )}
                                                </td>

                                                {/* Serviços */}
                                                <td className='px-6 py-3'>
                                                    {slot.booking ? (
                                                        <span className='text-sm text-gray-700'>
                                                            {(slot.booking as any).service_names?.join(', ') || 'Serviço'}
                                                        </span>
                                                    ) : (
                                                        <span className='text-gray-400'>Disponível</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className='px-6 py-3'>
                                                    {slot.booking ? (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(slot.booking.status)}`}>
                                                            {getStatusLabel(slot.booking.status)}
                                                        </span>
                                                    ) : slotWithAvailability.available ? (
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                            Livre
                                                        </span>
                                                    ) : (
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                                            Ocupado
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginação */}
                    {pagination.totalPages > 1 && (
                        <div className='flex items-center justify-between'>
                            <div className='text-sm text-gray-600'>
                                Mostrando {bookings.length} de {pagination.total} agendamentos
                            </div>
                            <div className='flex gap-2'>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Anterior
                                </Button>
                                <span className='px-3 py-2 text-sm'>
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Estado vazio */}
                    {bookings.length === 0 && !loading && (
                        <div className='flex flex-col items-center justify-center h-64'>
                            <Calendar className='h-12 w-12 text-gray-400 mb-4' />
                            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Nenhum agendamento encontrado</h3>
                            <p className='text-gray-600 text-center mb-4'>
                                Nenhum agendamento encontrado para {selectedDate.toLocaleDateString('pt-BR', { 
                                    weekday: 'long', 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                })}
                            </p>
                            <p className='text-gray-500 text-center text-sm mb-4'>
                                Tente selecionar outro dia ou criar um novo agendamento
                            </p>
                            <Button 
                                onClick={() => nav('/bookings')} 
                                className='bg-[#317CE5] hover:bg-[#2563eb]'
                            >
                                <Plus className='h-4 w-4 mr-2' />
                                Novo Agendamento
                            </Button>
                        </div>
                    )}

                </div>
            </SidebarInset>

            {/* Modal de Novo Agendamento */}
            <AddBookings
                isOpen={isNewBookingModalOpen}
                onClose={() => setIsNewBookingModalOpen(false)}
                onBookingCreated={() => {
                    loadData()
                    loadSchedule(selectedDate)
                }}
                selectedDate={selectedDate}
            />
        </SidebarProvider>
    )
}
