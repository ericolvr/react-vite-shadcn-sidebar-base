import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    Calendar, 
    Clock, 
    User, 
    Car, 
    Phone, 
    MapPin,
    Search,
    Filter,
    Plus,
    RefreshCw,
    Loader2,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'
import { bookingsListService, type Booking, type BookingService } from './list-service'
import { companySettingsService, type CompanySettingsResponse } from '../settings/service'
import { servicesService, type ServiceResponse } from '../services/service'

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

type TimeSlot = {
    time: string
    booking?: Booking
    isStart?: boolean  // Se é o início do serviço
    isContinuation?: boolean  // Se é continuação do serviço
}

export function BookingsList() {
    const nav = useNavigate()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [companySettings, setCompanySettings] = useState<CompanySettingsResponse | null>(null)
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)
    const [services, setServices] = useState<ServiceResponse[]>([])
    const [selectedService, setSelectedService] = useState<string>('')
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
                
                console.log(`🕐 Booking ${b.id}: ${bookingDateTime} → ${bookingTime} (SEM timezone)`)

                // Calcular duração total dos serviços
                const totalDuration = b.services.reduce((total: number, service: any) => total + service.duration, 0)
                
                // Converter horários para minutos para facilitar cálculos
                const slotMinutes = timeToMinutes(time)
                const bookingStartMinutes = timeToMinutes(bookingTime)
                const bookingEndMinutes = bookingStartMinutes + totalDuration

                // Verificar se o slot atual está dentro do período do booking
                const isOccupied = slotMinutes >= bookingStartMinutes && slotMinutes < bookingEndMinutes

                if (isOccupied) {
                    console.log(`🔍 Slot ${time} ocupado por booking ${bookingTime}-${minutesToTime(bookingEndMinutes)} (ID: ${b.id}, ${totalDuration}min)`)
                }

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

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Gerar slots de tempo para a data selecionada (sem depender de configurações)
            const slots = generateTimeSlots(null, selectedDate)
            
            // Formatar data selecionada para API (YYYY-MM-DD)
            const dateString = selectedDate.toISOString().split('T')[0]
            
            // Carregar bookings filtrados por data
            const response = await bookingsListService.getBookings(
                pagination.page, 
                pagination.limit,
                undefined, // search
                undefined, // status
                dateString // date
            )
            
            console.log(`📊 API retornou ${response.bookings.length} agendamentos para ${dateString}`)
            
            // FILTRO: Manter apenas agendamentos da data selecionada
            const bookingsForSelectedDate = response.bookings.filter((booking: any) => {
                const bookingDateTime = booking.scheduled_at || booking.started_at
                if (!bookingDateTime) return false
                
                // Extrair apenas a data (YYYY-MM-DD)
                const bookingDate = bookingDateTime.split('T')[0]
                const matches = bookingDate === dateString
                
                if (matches) {
                    console.log(`✅ Booking ${booking.id} pertence ao dia ${dateString}`)
                } else {
                    console.log(`❌ Booking ${booking.id} é do dia ${bookingDate}, não ${dateString}`)
                }
                
                return matches
            })
            
            console.log(`🎯 Após filtro: ${bookingsForSelectedDate.length} agendamentos para ${dateString}`)
            
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
        try {
            const response = await servicesService.getServices(1, 100) // Buscar todos os serviços
            setServices(response.services.filter(service => service.active)) // Apenas serviços ativos
        } catch (error) {
            console.error('Erro ao carregar serviços:', error)
        }
    }

    useEffect(() => {
        loadData()
        loadServices() // Carregar serviços também
    }, [pagination.page, selectedDate])

    const getStatusColor = (status: BookingStatus): string => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusLabel = (status: BookingStatus): string => {
        switch (status) {
            case 'pending': return 'Pendente'
            case 'confirmed': return 'Confirmado'
            case 'in_progress': return 'Em Andamento'
            case 'completed': return 'Concluído'
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
                            <RefreshCw className='h-4 w-4 mr-2' />
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
                    
                    {/* Header com título e ações */}
                    <div className='flex justify-between items-center'>
                        <div className='flex gap-2'>
                            <Button 
                                onClick={() => setIsNewBookingModalOpen(true)} 
                                className='bg-[#317CE5] hover:bg-[#2563eb]'
                                size="sm"
                            >
                                <Plus className='h-4 w-4 mr-2' />
                                Novo Agendamento
                            </Button>
                            <Button onClick={handleRefresh} variant="outline" size="sm">
                                <RefreshCw className='h-4 w-4 mr-2' />
                                Atualizar
                            </Button>
                        </div>
                    </div>

                    {/* Seletor de Dias da Semana */}
                    <div className='flex flex-col gap-4'>
                        
                        <div className='flex gap-2 overflow-x-auto pb-2'>
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
                                                ? 'bg-[#317CE5] text-white border-[#317CE5]' 
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
                    </div>

                    {/* Tabela de Horários */}
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
                                                PLACA
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
                                    {timeSlots.map((slot, index) => (
                                        <tr key={index} className={`transition-colors ${slot.booking ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                                            {/* Horário */}
                                            <td className='px-6 py-3'>
                                                <span className='font-semibold text-black text-[14.5px]'>
                                                    {slot.time}
                                                </span>
                                            </td>

                                            {/* Placa */}
                                            <td className='px-6 py-3'>
                                                {slot.booking ? (
                                                    <span className='font-semibold text-black text-[14.5px]'>
                                                        {slot.booking.vehicle_plate}
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-400'>-</span>
                                                )}
                                            </td>

                                            {/* Serviços */}
                                            <td className='px-6 py-3'>
                                                {slot.booking ? (
                                                    <div className='space-y-1'>
                                                        {slot.isStart ? (
                                                            // Mostrar detalhes completos apenas no início
                                                            slot.booking.services.map((service) => (
                                                                <div key={service.id} className='text-gray-900 font-medium text-sm'>
                                                                    {service.name} ({service.duration}min)
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // Mostrar indicação de continuação
                                                            <div className='text-gray-600 text-sm italic'>
                                                                ↳ Em andamento...
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className='text-gray-400'>Disponível</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className='px-6 py-3'>
                                                {slot.booking ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(slot.booking.status)}`}>
                                                        {slot.isStart ? getStatusLabel(slot.booking.status) : 'Ocupado'}
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                                                        Livre
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
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

            {/* Dialog de Novo Agendamento */}
            <Dialog open={isNewBookingModalOpen} onOpenChange={setIsNewBookingModalOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Novo Agendamento</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Select value={selectedService} onValueChange={setSelectedService}>
                                <SelectTrigger className="w-full h-[60px]">
                                    <SelectValue placeholder="Selecione um serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={service.id.toString()}>
                                            <div className="flex justify-between items-center w-full">
                                                <span>{service.name}</span>
                                                <div className="flex gap-2 text-xs text-gray-500 ml-2">
                                                    <span>R$ {service.price.toFixed(2)}</span>
                                                    <span>{service.duration}min</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsNewBookingModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button className="bg-[#317CE5] hover:bg-[#2563eb]">
                                Salvar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    )
}
