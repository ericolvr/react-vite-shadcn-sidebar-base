import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Clock, Loader2 } from 'lucide-react'
import { servicesService, type ServiceResponse } from '../../services/service'
import { bookingsListService, type CreateBookingRequest } from '../list-service'
import CustomerSelector from './customer_selector'
import { type Vehicle } from './vehicle-service'
import { useAuth } from '@/contexts/context'

interface AddBookingsProps {
    isOpen: boolean
    onClose: () => void
    onBookingCreated: () => void
    selectedDate: Date
}

export default function AddBookings({ isOpen, onClose, onBookingCreated, selectedDate }: AddBookingsProps) {
    const { isLoggedIn, getUserData } = useAuth()
    
    // Estados
    const [services, setServices] = useState<ServiceResponse[]>([])
    const [selectedService, setSelectedService] = useState<string>('')
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [isScheduleOpen, setIsScheduleOpen] = useState(true)
    const [modalSelectedDate, setModalSelectedDate] = useState<Date>(selectedDate)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

    // Gerar dias da semana (hoje + 6 dias)
    const generateWeekDays = () => {
        const days = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            days.push(date)
        }
        return days
    }

    // Carregar serviços
    const loadServices = async () => {
        try {
            if (!isLoggedIn()) {
                return
            }
            
            const userData = getUserData()
            if (!userData.company_id) {
                return
            }
            
            const response = await servicesService.getServices(userData.company_id, 1, 100)
            
            if (!response.services || response.services.length === 0) {
                setServices([])
                return
            }
            
            const activeServices = response.services.filter(service => service.active)
            setServices(activeServices)
        } catch (error) {
            console.error('💥 AddBookings: Erro ao carregar serviços:', error)
        }
    }

    // Buscar slots disponíveis para o serviço selecionado
    const loadAvailableSlots = useCallback(async (serviceId: string) => {
        if (!serviceId || !isOpen) {
            setAvailableSlots([])
            return
        }

        try {
            setLoadingSlots(true)
            const dateString = modalSelectedDate.toISOString().split('T')[0]
            const companyId = 1 // ID da empresa
            const serviceIds = [parseInt(serviceId)]
            
            const slots = await bookingsListService.getAvailableSlots(companyId, dateString, serviceIds)
            setAvailableSlots(slots)
        } catch (error) {
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }, [modalSelectedDate, isOpen])

    // Manipular mudança de serviço
    const handleServiceChange = (value: string) => {
        setSelectedService(value)
        setSelectedTimeSlot('')
        if (value) {
            loadAvailableSlots(value)
            setIsScheduleOpen(true)
        }
    }

    // Manipular seleção de horário
    const handleTimeSlotSelection = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot)
        setIsScheduleOpen(false) // Fechar o collapse automaticamente
    }

    // Função para calcular horário de fim
    const getEndTime = (startTime: string, duration: number): string => {
        let timeStr = startTime
        if (startTime.includes('T')) {
            timeStr = startTime.split('T')[1].substring(0, 5)
        }
        
        const [hours, minutes] = timeStr.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + duration
        const endHours = Math.floor(totalMinutes / 60)
        const endMinutes = totalMinutes % 60
        
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    }

    // Verificar se slot está ocupado
    const isSlotOccupied = (slot: string): boolean => {
        return false // Implementar lógica se necessário
    }

    // Criar booking
    const handleCreateBooking = async () => {
        if (!selectedService || !selectedTimeSlot || !selectedCustomer || !selectedVehicle) {
            alert('Por favor, preencha todos os campos obrigatórios')
            return
        }

        try {
            const userData = getUserData()
            if (!userData.company_id) {
                throw new Error('Company ID não encontrado')
            }

            // Criar data/hora do agendamento
            const [hours, minutes] = selectedTimeSlot.split(':')
            const scheduledDateTime = new Date(modalSelectedDate)
            scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

            const bookingData: CreateBookingRequest = {
                company_id: userData.company_id,
                customer_id: selectedCustomer.id,
                vehicle_id: selectedVehicle.id,
                service_ids: [parseInt(selectedService)],
                scheduled_at: scheduledDateTime.toISOString(),
                notes: `Agendamento criado via sistema - ${selectedTimeSlot}`
            }

            console.log('📝 AddBookings: Criando booking com dados:', bookingData)
            
            const newBooking = await bookingsListService.createBooking(bookingData)
            console.log('✅ AddBookings: Booking criado com sucesso:', newBooking)
            
            // Limpar formulário
            setSelectedService('')
            setSelectedTimeSlot('')
            setSelectedCustomer(null)
            setSelectedVehicle(null)
            setAvailableSlots([])
            
            // Fechar modal e recarregar dados
            onClose()
            onBookingCreated()
            
        } catch (error: any) {
            console.error('💥 AddBookings: Erro ao criar booking:', error)
            alert(`Erro ao criar agendamento: ${error.message}`)
        }
    }

    // Carregar serviços quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            loadServices()
        }
    }, [isOpen])

    // Recarregar slots quando a data do modal mudar
    useEffect(() => {
        if (selectedService && isOpen) {
            loadAvailableSlots(selectedService)
            setSelectedTimeSlot('')
            setIsScheduleOpen(true)
        }
    }, [modalSelectedDate, selectedService, isOpen, loadAvailableSlots])

    // Atualizar data selecionada quando prop mudar
    useEffect(() => {
        setModalSelectedDate(selectedDate)
    }, [selectedDate])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Linha com Serviço e Dias da Semana */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Serviço</label>
                            <label className="text-sm font-medium">Data</label>
                        </div>
                        <div className="flex gap-4 items-start">
                            {/* Select de Serviço */}
                            <div className="flex-1">
                                <Select value={selectedService} onValueChange={handleServiceChange}>
                                    <SelectTrigger className="w-full h-[60px]">
                                        <SelectValue placeholder="Selecione um serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.length === 0 && (
                                            <SelectItem value="no-services" disabled>
                                                Nenhum serviço disponível
                                            </SelectItem>
                                        )}
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

                            {/* Botões dos Dias da Semana */}
                            <div className="flex gap-1">
                                {generateWeekDays().map((day, index) => {
                                    const isSelected = day.toDateString() === modalSelectedDate.toDateString()
                                    const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
                                    const dayNumber = day.getDate()
                                    
                                    // Verificar se é data passada (antes de hoje)
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    const dayToCompare = new Date(day)
                                    dayToCompare.setHours(0, 0, 0, 0)
                                    const isPastDate = dayToCompare < today
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => !isPastDate && setModalSelectedDate(day)}
                                            disabled={isPastDate}
                                            className={`
                                                flex flex-col items-center justify-center p-2 rounded-lg border transition-colors min-w-[50px] h-[60px]
                                                ${isPastDate 
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50' 
                                                    : isSelected 
                                                        ? 'bg-[#317CE5] text-white border-[#317CE5]' 
                                                        : 'bg-white hover:bg-gray-50 border-gray-200 cursor-pointer'
                                                }
                                            `}
                                        >
                                            <span className="text-xs font-medium">{dayName}</span>
                                            <span className="text-sm font-bold">{dayNumber}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Collapsible de Horários */}
                    {selectedService && (
                        <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                            <div className="space-y-2">
                                <CollapsibleTrigger asChild>
                                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedTimeSlot 
                                            ? 'bg-[#317CE5] text-white border-[#317CE5] hover:bg-[#2563eb]' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        {selectedTimeSlot ? (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-white" />
                                                <span className="font-medium">
                                                    {services.find(s => s.id.toString() === selectedService)?.name} • {' '}
                                                    {selectedTimeSlot.includes('T') ? selectedTimeSlot.split('T')[1].substring(0, 5) : selectedTimeSlot} às {' '}
                                                    {getEndTime(selectedTimeSlot, services.find(s => s.id.toString() === selectedService)?.duration || 0)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    Horários Disponíveis Hoje
                                                    {loadingSlots && <span className="text-xs text-gray-500 ml-2">(carregando...)</span>}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {isScheduleOpen ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center p-8 text-gray-500">
                                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                            Carregando horários...
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden max-h-[32rem] overflow-y-auto">
                                            {availableSlots.filter((slot) => {
                                                // Filtrar horários que já passaram se for hoje
                                                const today = new Date()
                                                const selectedDay = new Date(modalSelectedDate)
                                                
                                                // Se não for hoje, mostrar todos os horários
                                                if (selectedDay.toDateString() !== today.toDateString()) {
                                                    return true
                                                }
                                                
                                                // Se for hoje, verificar se o horário já passou
                                                let slotTime: string
                                                if (slot.includes('T')) {
                                                    // Formato ISO: "2025-10-27T08:00:00Z"
                                                    slotTime = slot.split('T')[1].substring(0, 5)
                                                } else {
                                                    // Formato simples: "08:00"
                                                    slotTime = slot
                                                }
                                                
                                                const [hours, minutes] = slotTime.split(':').map(Number)
                                                const slotDateTime = new Date()
                                                slotDateTime.setHours(hours, minutes, 0, 0)
                                                
                                                // Retornar true se o horário ainda não passou
                                                return slotDateTime > today
                                            }).map((slot) => (
                                                <div
                                                    key={slot}
                                                    onClick={() => handleTimeSlotSelection(slot)}
                                                    className={`
                                                        flex items-center justify-between p-4 border-b last:border-b-0 cursor-pointer transition-colors
                                                        ${selectedTimeSlot === slot 
                                                            ? 'bg-[#317CE5] text-white' 
                                                            : isSlotOccupied(slot)
                                                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                                : 'bg-white hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <span className="font-medium text-sm">
                                                        {slot.includes('T') ? slot.split('T')[1].substring(0, 5) : slot}
                                                    </span>
                                                    <span className="text-sm opacity-75">
                                                        Disponível
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-gray-500 border rounded-lg bg-gray-50">
                                            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            {(() => {
                                                const today = new Date()
                                                const selectedDay = new Date(modalSelectedDate)
                                                const isToday = selectedDay.toDateString() === today.toDateString()
                                                
                                                if (isToday) {
                                                    return (
                                                        <>
                                                            <p>Nenhum horário disponível hoje</p>
                                                            <p className="text-xs mt-1">Os horários de hoje já passaram. Tente selecionar outro dia.</p>
                                                        </>
                                                    )
                                                } else {
                                                    return (
                                                        <>
                                                            <p>Nenhum horário disponível para este serviço</p>
                                                            <p className="text-xs mt-1">Tente selecionar outro dia</p>
                                                        </>
                                                    )
                                                }
                                            })()}
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    )}

                    {/* Seletor de Cliente - aparece apenas quando horário for selecionado */}
                    {selectedTimeSlot && (
                        <CustomerSelector 
                            onVehicleSelect={setSelectedVehicle}
                            selectedVehicle={selectedVehicle || undefined}
                        />
                    )}

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleCreateBooking}
                            disabled={!selectedService || !selectedTimeSlot || !selectedCustomer || !selectedVehicle}
                            className="bg-[#317CE5] hover:bg-[#2563eb]"
                        >
                            Salvar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
