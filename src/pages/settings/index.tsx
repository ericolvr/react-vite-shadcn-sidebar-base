
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema de validação baseado na struct Go
const companySettingsSchema = z.object({
	startWorkTime: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	endWorkTime: z.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:MM')
		.refine((time) => {
			const [hours, minutes] = time.split(':').map(Number)
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
		}, 'Horário inválido'),
	
	pointsPerReal: z.number()
		.min(0, 'Deve ser um valor positivo')
		.max(100, 'Máximo 100 pontos por real')
		.optional(),
	
	enableLoyalty: z.string().default("false"),
	
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
	// Validação customizada: horário de fim deve ser após horário de início
	if (data.startWorkTime && data.endWorkTime) {
		const [startHours, startMinutes] = data.startWorkTime.split(':').map(Number)
		const [endHours, endMinutes] = data.endWorkTime.split(':').map(Number)
		
		const startTotalMinutes = startHours * 60 + startMinutes
		const endTotalMinutes = endHours * 60 + endMinutes
		
		return endTotalMinutes > startTotalMinutes
	}
	return true
}, {
	message: 'Horário de fim deve ser posterior ao horário de início',
	path: ['endWorkTime']
})

type CompanySettingsForm = z.infer<typeof companySettingsSchema>

export function Settings() {
	const form = useForm<CompanySettingsForm>({
		resolver: zodResolver(companySettingsSchema),
		defaultValues: {
			startWorkTime: '08:00',
			endWorkTime: '18:00',
			pointsPerReal: 1,
			enableLoyalty: "false",
			site: '',
			email: '',
			phone: '',
			mobile: ''
		}
	})

	const onSubmit = (data: CompanySettingsForm) => {
		console.log('Dados do formulário:', data)
		// Aqui você faria a chamada para a API
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
															type="tel" 
															placeholder="(11) 1234-5678"
															{...field}
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
															type="tel" 
															placeholder="(11) 91234-5678"
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
										name="startWorkTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-REGULAR'>Início -  Dia de semana</FormLabel>
												<FormControl>
													<Input 
														type="time" 
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
										name="endWorkTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-regular'>Término - Dia de semana</FormLabel>
												<FormControl>
													<Input 
														type="time" 
														{...field}
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
										name="startWorkTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-REGULAR'>Início -  Final de semana</FormLabel>
												<FormControl>
													<Input 
														type="time" 
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
										name="endWorkTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-regular'>Término - Final de Semana</FormLabel>
												<FormControl>
													<Input 
														type="time" 
														{...field}
														className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								
								<div className='grid grid-cols-2 md:grid-cols-2 gap-6'>
									<FormField
										control={form.control}
										name="enableLoyalty"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-medium'>Programa de Fidelidade</FormLabel>
												<FormControl>
													<Select value={field.value} onValueChange={field.onChange}>
														<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="false">Inativo</SelectItem>
															<SelectItem value="true">Ativo</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
											</FormItem>
										)}
									/>

									{form.watch('enableLoyalty') === "true" && (
										<FormField
											control={form.control}
											name="pointsPerReal"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Pontos por Real</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															step="0.1"
															min="0"
															max="100"
															{...field}
															onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>

								

								{/* Botões de Ação */}
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
										className='bg-[#317CE5] hover:bg-[#2563eb] font-inter'
									>
										Salvar Configurações
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
