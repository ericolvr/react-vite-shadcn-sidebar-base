
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

interface TimeSlot {
	id: string
	time: string
	available: boolean
}

interface DayData {
	date: Date
	dayName: string
	dayNumber: number
	timeSlots: TimeSlot[]
}

interface Service {
	id: string
	name: string
	duration: number // em minutos
}

type ServiceStatus = 'agendado' | 'aspirando' | 'lavando' | 'secando' | 'finalizado'

interface BookingWithStatus {
	time: string
	service: Service
	date: Date
	status: ServiceStatus
}

const services: Service[] = [
	{ id: 'simples', name: 'Lavagem Simples', duration: 45 },
	{ id: 'cera', name: 'Lavagem Com Cera', duration: 60 },
	{ id: 'enceramento', name: 'Enceramento', duration: 90 }
]

const PLATE = 'ABC 1234'

export function Bookings() {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [selectedService, setSelectedService] = useState<Service>(services[0])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [confirmedBooking, setConfirmedBooking] = useState<BookingWithStatus | null>(null)
	const [showCancelModal, setShowCancelModal] = useState<boolean>(false)

	// Gerar próximos 7 dias
	const generateDays = (): DayData[] => {
		const days: DayData[] = []
		const today = new Date()
		
		for (let i = 0; i < 7; i++) {
			const date = new Date(today)
			date.setDate(today.getDate() + i)
			
			const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
			
			days.push({
				date,
				dayName: dayNames[date.getDay()],
				dayNumber: date.getDate(),
				timeSlots: generateTimeSlots()
			})
		}
		
		return days
	}

	// Gerar horários disponíveis (intervalos de 15 minutos)
	const generateTimeSlots = (): TimeSlot[] => {
		const slots: TimeSlot[] = []
		const startHour = 8 // 8:00
		const endHour = 18 // 18:00
		
		for (let hour = startHour; hour < endHour; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
				slots.push({
					id: `${hour}-${minute}`,
					time: timeString,
					available: Math.random() > 0.3 // 70% dos horários disponíveis
				})
			}
		}
		
		return slots
	}

	const days = generateDays()

	const formatDate = (date: Date) => {
		const months = [
			'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
			'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
		]
		
		return `${months[date.getMonth()]} ${date.getFullYear()}`
	}

	const isToday = (date: Date) => {
		const today = new Date()
		return date.toDateString() === today.toDateString()
	}

	const isSameDay = (date1: Date, date2: Date) => {
		return date1.toDateString() === date2.toDateString()
	}

	const selectedDayData = days.find(day => isSameDay(day.date, selectedDate))

	// Função para calcular o próximo horário baseado na duração do serviço
	const getNextTimeSlot = (currentTime: string): string => {
		const [hours, minutes] = currentTime.split(':').map(Number)
		const totalMinutes = hours * 60 + minutes + selectedService.duration
		const nextHours = Math.floor(totalMinutes / 60)
		const nextMinutes = totalMinutes % 60
		return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`
	}

	// Função para verificar se há slots consecutivos disponíveis para o serviço
	const canScheduleService = (startTime: string, dayData: DayData): boolean => {
		const [startHours, startMinutes] = startTime.split(':').map(Number)
		const startTotalMinutes = startHours * 60 + startMinutes
		const endTotalMinutes = startTotalMinutes + selectedService.duration
		
		// Verifica se todos os slots necessários estão disponíveis
		for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 15) {
			const hours = Math.floor(minutes / 60)
			const mins = minutes % 60
			const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
			
			const slot = dayData.timeSlots.find(s => s.time === timeString)
			if (!slot || !slot.available) {
				return false
			}
		}
		
		return true
	}

	// Função para verificar se um horário está bloqueado pelo horário selecionado
	const isTimeSlotBlocked = (slotTime: string): boolean => {
		if (!selectedTime) return false
		
		const [selectedHours, selectedMinutes] = selectedTime.split(':').map(Number)
		const [slotHours, slotMinutes] = slotTime.split(':').map(Number)
		
		const selectedTotalMinutes = selectedHours * 60 + selectedMinutes
		const slotTotalMinutes = slotHours * 60 + slotMinutes
		const endTotalMinutes = selectedTotalMinutes + selectedService.duration
		
		// Verifica se o horário está dentro do período de duração do serviço (excluindo o horário inicial)
		// Para 45min: 08:00 selecionado deve bloquear 08:15, 08:30, 08:45 (incluindo horário de término)
		return slotTotalMinutes > selectedTotalMinutes && 
			   slotTotalMinutes <= endTotalMinutes
	}

	// Função para verificar se um horário faz parte de um agendamento confirmado
	const isPartOfConfirmedRange = (slotTime: string, booking: BookingWithStatus): boolean => {
		const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number)
		const [slotHours, slotMinutes] = slotTime.split(':').map(Number)
		
		const bookingTotalMinutes = bookingHours * 60 + bookingMinutes
		const slotTotalMinutes = slotHours * 60 + slotMinutes
		const endTotalMinutes = bookingTotalMinutes + booking.service.duration
		
		return slotTotalMinutes >= bookingTotalMinutes && 
			   slotTotalMinutes <= endTotalMinutes
	}


	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='bg-white'>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Agendamentos'},
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1'>
						
						{/* Dias da semana */}
						<div className='mb-8'>
							<div className='flex justify-between items-center mb-4'>
								
								<div className='flex items-center gap-3'>
									{services.map((service) => (
										<button
											key={service.id}
											onClick={() => {
												setSelectedService(service)
												setSelectedTime(null) // Reset selected time when changing service
												setErrorMessage(null) // Clear error message when changing service
											}}
											className={`
												px-4 h-[90px] rounded-lg border transition-all font-inter font-medium text-sm flex items-center justify-center
												${selectedService.id === service.id
													? 'bg-[#317CE5] text-white border-[#317CE5]'
													: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
												}
											`}
										>
											<div className='text-center'>
												<div>{service.name}</div>
												<div className='text-xs opacity-75'>{service.duration} minutos</div>
											</div>
										</button>
									))}
								</div>
								
								<div className='flex gap-3 overflow-x-auto pb-2'>
								{days.map((day) => (
									<button
										key={day.date.toISOString()}
										onClick={() => setSelectedDate(day.date)}
										className={`
											flex flex-col items-center justify-center w-[100px] rounded-sm transition-all mr-2 px-6 h-[90px] w-[]
											${isSameDay(day.date, selectedDate) 
												? 'bg-[#317CE5] text-white' 
												: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
											}
											${isToday(day.date) && !isSameDay(day.date, selectedDate) 
												? 'ring-2 ring-[#317CE5]' 
												: ''
											}
										`}
									>
										<span className='text-[14px] font-medium font-inter mb-1'>{day.dayName}</span>
										<span className='text-lg font-bold font-inter'>{day.dayNumber}</span>
									</button>
								))}
								</div>
								
							</div>
						</div>

						{/* Horários disponíveis */}
						<div className='flex-1'>
							
							{errorMessage && (
								<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
									<p className='text-sm text-red-600 font-inter'>{errorMessage}</p>
								</div>
							)}
							
							<div className='grid grid-cols-5 gap-3 pb-24'>
								{selectedDayData?.timeSlots.map((slot) => {
									const isBlocked = isTimeSlotBlocked(slot.time)
									const isSelected = selectedTime === slot.time
									const isPartOfSelectedRange = isSelected || isBlocked
									
									// Verificar se este slot faz parte de um agendamento confirmado
									const isConfirmed = confirmedBooking && 
										isSameDay(confirmedBooking.date, selectedDate) &&
										isPartOfConfirmedRange(slot.time, confirmedBooking)
									
									const handleSlotClick = () => {
										// Se é um agendamento confirmado, mostrar modal de cancelamento
										if (isConfirmed) {
											console.log('Opening cancel modal for confirmed booking')
											setShowCancelModal(true)
											return
										}
										
										// Se clicar em qualquer parte do bloco selecionado (não confirmado), cancela facilmente
										if (isPartOfSelectedRange) {
											setSelectedTime(null)
											setErrorMessage(null)
											return
										}
										
										if (!slot.available) return
										
										if (selectedDayData && canScheduleService(slot.time, selectedDayData)) {
											setSelectedTime(slot.time)
											setErrorMessage(null)
										} else {
											setErrorMessage(`Não é possível agendar ${selectedService.name} às ${slot.time}. Verifique se há horários consecutivos disponíveis.`)
											setSelectedTime(null)
										}
									}
									
									return (
										<button
											key={slot.id}
											onClick={handleSlotClick}
											disabled={!slot.available && !isPartOfSelectedRange}
											className={`
												h-16 rounded-lg transition-all font-inter font-medium flex items-center justify-center
												${isConfirmed
													? 'cursor-pointer text-white' 
													: isPartOfSelectedRange
														? 'cursor-pointer text-white' 
														: slot.available 
															? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
															: 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
												}
											`}
											style={
												isConfirmed ? {
													backgroundColor: '#317CE5' // Azul para confirmado
												} : isPartOfSelectedRange ? {
													backgroundColor: '#f27983' // Coral para selecionado
												} : {}
											}
										>
											{isConfirmed ? (
												<div className='text-center'>
													<div>{slot.time}</div>
													<div className='text-xs opacity-75 mt-1'>
														<span className='font-bold'>{PLATE}</span> - <span className='capitalize font-medium'>{confirmedBooking.status}</span>
													</div>
												</div>
											) : isPartOfSelectedRange ? (
												<div className='text-center'>
													<div>{slot.time}</div>
													<div className='text-xs opacity-75 mt-1'>
														<span className='font-bold'>{PLATE}</span> - {selectedService.name}
													</div>
												</div>
											) : (
												<div>{slot.time}</div>
											)}
										</button>
									)
								})}
							</div>
						</div>

						{/* Botão de confirmação */}
						{selectedTime && (
							<div className='fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:max-w-md'>
								<Button 
									onClick={() => {
										setConfirmedBooking({
											time: selectedTime,
											service: selectedService,
											date: selectedDate,
											status: 'agendado'
										})
										setSelectedTime(null)
									}}
									className='w-full h-14 bg-[#317CE5] hover:bg-[#2563eb] text-white font-semibold font-inter rounded-xl'
								>
									<div className='text-center'>
										<div>Confirmar {selectedService.name} - {selectedTime}</div>
										<div className='text-xs opacity-90'>
											Duração: {selectedService.duration}min (até {getNextTimeSlot(selectedTime)})
										</div>
									</div>
								</Button>
							</div>
						)}

						{/* Modal de gerenciamento do agendamento */}
						<Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
							<DialogContent className='max-w-lg bg-white'>
								<DialogHeader>
									<DialogTitle className='font-inter'>{PLATE}</DialogTitle>
									<DialogDescription className='font-inter leading-relaxed'>
										<div className='flex flex-row items-center justify-between mt-2 mb-2'>
											<p className='font-regular text-black'>{confirmedBooking?.service.name}</p>
											<p className='font-regular text-black'>{confirmedBooking?.time}</p>
										</div>

										<div className='space-y-1'>
											<p className='font-regular capitalize text-black'>{confirmedBooking?.status}</p>
										</div>
									</DialogDescription>
								</DialogHeader>
								
								{/* Botões de Status */}
								<div className='space-y-3'>
									<div className='grid grid-cols-2 gap-2'>
										<Button 
											onClick={() => {
												if (confirmedBooking) {
													setConfirmedBooking({...confirmedBooking, status: 'aspirando'})
												}
											}}
											variant={confirmedBooking?.status === 'aspirando' ? 'default' : 'outline'}
											className='font-inter text-sm'
										>
											1 - Aspirando
										</Button>
										<Button 
											onClick={() => {
												if (confirmedBooking) {
													setConfirmedBooking({...confirmedBooking, status: 'lavando'})
												}
											}}
											variant={confirmedBooking?.status === 'lavando' ? 'default' : 'outline'}
											className='font-inter text-sm'
										>
											2 - Lavando
										</Button>
										<Button 
											onClick={() => {
												if (confirmedBooking) {
													setConfirmedBooking({...confirmedBooking, status: 'secando'})
												}
											}}
											variant={confirmedBooking?.status === 'secando' ? 'default' : 'outline'}
											className='font-inter text-sm'
										>
											3 - Secagem
										</Button>
										<Button 
											onClick={() => {
												if (confirmedBooking) {
													setConfirmedBooking({...confirmedBooking, status: 'finalizado'})
												}
											}}
											variant={confirmedBooking?.status === 'finalizado' ? 'default' : 'outline'}
											className='font-inter text-sm'
										>
											4 - Finalizado
										</Button>
									</div>
								</div>

								<DialogFooter className='gap-3 pt-4 border-t'>
									<Button 
										onClick={() => {
											setConfirmedBooking(null)
											setShowCancelModal(false)
										}}
										variant="destructive"
										className="font-inter"
									>
										Cancelar Agendamento
									</Button>
									<Button 
										onClick={() => setShowCancelModal(false)}
										variant="outline"
										className="font-inter"
									>
										Atualizar Status
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
  	)
}
