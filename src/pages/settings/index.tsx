
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { companySettingsService, type CompanySettingsData } from './service'
import { applyTimeMask, applyPhoneMask, applyMobileMask, extractNumbers } from '@/utils/masks'

// Schema de validação alinhado com CompanySettings do backend
const companySettingsSchema = z.object({
	// Horários de funcionamento - dias de semana
	startWorkWeekday: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	endWorkWeekday: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	// Horários de funcionamento - fins de semana
	startWorkWeekend: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	endWorkWeekend: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	// Informações de contato
	site: z.string()
		.url('URL inválida')
		.optional()
		.or(z.literal('')),
	
	email: z.string()
		.email('Email inválido')
		.optional()
		.or(z.literal('')),
	
	phone: z.string()
		.regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 1234-5678')
		.optional()
		.or(z.literal('')),
	
	mobile: z.string()
		.regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Formato: (11) 91234-5678')
		.optional()
		.or(z.literal(''))
	}).refine((data) => {
	// Validação: horário de fim deve ser após horário de início (dias de semana)
	if (data.startWorkWeekday && data.endWorkWeekday) {
		const [startHours, startMinutes] = data.startWorkWeekday.split(':').map(Number)
		const [endHours, endMinutes] = data.endWorkWeekday.split(':').map(Number)
		
		const startTotalMinutes = startHours * 60 + startMinutes
		const endTotalMinutes = endHours * 60 + endMinutes
		
		if (endTotalMinutes <= startTotalMinutes) return false
	}
	
	// Validação: horário de fim deve ser após horário de início (fins de semana)
	if (data.startWorkWeekend && data.endWorkWeekend) {
		const [startHours, startMinutes] = data.startWorkWeekend.split(':').map(Number)
		const [endHours, endMinutes] = data.endWorkWeekend.split(':').map(Number)
		
		const startTotalMinutes = startHours * 60 + startMinutes
		const endTotalMinutes = endHours * 60 + endMinutes
		
		if (endTotalMinutes <= startTotalMinutes) return false
	}
	
	return true
}, {
	message: 'Horários de fim devem ser posteriores aos horários de início',
	path: ['endWorkWeekday']
})

type CompanySettingsForm = z.infer<typeof companySettingsSchema>

export function Settings() {
	const form = useForm<CompanySettingsForm>({
		resolver: zodResolver(companySettingsSchema),
		defaultValues: {
			startWorkWeekday: '08:00',
			endWorkWeekday: '18:00',
			startWorkWeekend: '09:00',
			endWorkWeekend: '17:00',
			site: '',
			email: '',
			phone: '',
			mobile: ''
		}
	})

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	// TODO: Obter companyId do contexto de autenticação
	const companyId = '1' // Temporário - deve vir do contexto/JWT

	// Carregar configurações existentes ao montar o componente
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const settings = await companySettingsService.getSettings(companyId)
				form.reset({
					startWorkWeekday: settings.startWorkWeekday,
					endWorkWeekday: settings.endWorkWeekday,
					startWorkWeekend: settings.startWorkWeekend,
					endWorkWeekend: settings.endWorkWeekend,
					site: settings.site || '',
					email: settings.email || '',
					phone: settings.phone || '',
					mobile: settings.mobile || ''
				})
			} catch (err) {
				// Se não existir configuração, manter valores padrão
				console.log('Configurações não encontradas, usando valores padrão')
			}
		}

		loadSettings()
	}, [form, companyId])

	const onSubmit = async (data: CompanySettingsForm) => {
		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			// Adicionar company_id ao payload e extrair apenas números dos telefones
			const settingsData = {
				...data,
				company_id: parseInt(companyId),
				phone: data.phone ? extractNumbers(data.phone) : '',
				mobile: data.mobile ? extractNumbers(data.mobile) : ''
			}

			// Tentar atualizar primeiro, se falhar, criar
			try {
				await companySettingsService.updateSettings(companyId, settingsData)
			} catch (updateError) {
				// Se falhar ao atualizar, tentar criar
				await companySettingsService.createSettings(companyId, settingsData)
			}

			setSuccess(true)
			setTimeout(() => setSuccess(false), 3000) // Remove mensagem após 3s
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao salvar configurações')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='bg-white'>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Configurações' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						

						{/* Mensagens de feedback */}
						{error && (
							<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4'>
								{error}
							</div>
						)}
						{success && (
							<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4'>
								Configurações salvas com sucesso!
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
								
								<div className='space-y-4'>									
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-regular'>Telefone Fixo</FormLabel>
													<FormControl>
														<Input 
															type="text" 
															placeholder="(11) 1234-5678"
															maxLength={14}
															{...field}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const maskedValue = applyPhoneMask(e.target.value)
																field.onChange(maskedValue)
															}}
															className='px-5 font-inter bg-[#F6F6F7] h-[50px] rounded-md border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="mobile"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Celular</FormLabel>
													<FormControl>
														<Input 
															type="text" 
															placeholder="(11) 91234-5678"
															maxLength={15}
															{...field}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const maskedValue = applyMobileMask(e.target.value)
																field.onChange(maskedValue)
															}}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-regular'>Email</FormLabel>
													<FormControl>
														<Input 
															type="email" 
															placeholder="contato@empresa.com"
															{...field}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="site"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-regular'>Site</FormLabel>
													<FormControl>
														<Input 
															type="url" 
															placeholder="https://www.empresa.com"
															{...field}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<FormField
										control={form.control}
										name="startWorkWeekday"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-REGULAR'>Início -  Dia de semana</FormLabel>
												<FormControl>
													<Input 
														type="text" 
														placeholder="08:00"
														maxLength={5}
														{...field}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															const maskedValue = applyTimeMask(e.target.value)
															field.onChange(maskedValue)
														}}
														className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="endWorkWeekday"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-regular'>Término - Dia de semana</FormLabel>
												<FormControl>
													<Input 
														type="text" 
														placeholder="18:00"
														maxLength={5}
														{...field}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															const maskedValue = applyTimeMask(e.target.value)
															field.onChange(maskedValue)
														}}
														className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<FormField
										control={form.control}
										name="startWorkWeekend"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-REGULAR'>Início -  Final de semana</FormLabel>
												<FormControl>
													<Input 
														type="text" 
														placeholder="09:00"
														maxLength={5}
														{...field}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															const maskedValue = applyTimeMask(e.target.value)
															field.onChange(maskedValue)
														}}
														className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="endWorkWeekend"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-regular'>Término - Final de Semana</FormLabel>
												<FormControl>
													<Input 
														type="text" 
														placeholder="17:00"
														maxLength={5}
														{...field}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
															const maskedValue = applyTimeMask(e.target.value)
															field.onChange(maskedValue)
														}}
														className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className='flex justify-end gap-4 pt-6 border-t'>
									<Button 
										type="button" 
										variant="outline"
										className='font-inter'
										onClick={() => form.reset()}
									>
										Cancelar
									</Button>
									<Button 
										type="submit"
										disabled={isLoading}
										className='bg-[#317CE5] hover:bg-[#2563eb] font-inter disabled:opacity-50 disabled:cursor-not-allowed'
									>
										{isLoading ? 'Salvando...' : 'Salvar Configurações'}
									</Button>
								</div>
							</form>
						</Form>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
  	)
}
