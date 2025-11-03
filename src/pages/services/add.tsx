import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { servicesService } from './service'


const serviceSchema = z.object({
	name: z.string()
		.min(1, 'Nome é obrigatório')
		.max(100, 'Nome deve ter no máximo 100 caracteres'),
	
	price: z.number()
		.min(1, 'Preço deve ser maior que 1')
		.max(10000, 'Preço máximo é R$ 10.000')
		.optional(),
	
	duration: z.number()
		.min(1, 'Duração mínima é 1 minuto')
		.max(480, 'Duração máxima é 8 horas')
		.optional(),
	
	vehicleType: z.string()
		.min(1, 'Tipo de veículo é obrigatório'),
	
	points: z.number()
		.min(0, 'Pontos devem ser positivos')
		.max(10000, 'Máximo 10.000 pontos')
		.optional(),
	
	active: z.boolean().optional()
})

type ServiceForm = z.infer<typeof serviceSchema>

export function ServicesAdd() {
	const nav = useNavigate()
	const form = useForm<ServiceForm>({
		resolver: zodResolver(serviceSchema),
		defaultValues: {
			name: '',
			price: undefined,
			duration: undefined,
			vehicleType: '',
			points: undefined,
			active: undefined
		}
	})

	const isActive = form.watch('active')

	useEffect(() => {
		if (!isActive) {
			form.setValue('points', undefined)
		}
	}, [isActive, form])

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const onSubmit = async (data: ServiceForm) => {
		if (data.price === undefined || data.price === 0) {
			form.setError('price', {
				type: 'manual',
				message: 'Preço é obrigatório e deve ser maior que zero'
			})
			return
		}

		if (data.duration === undefined || data.duration === 0) {
			form.setError('duration', {
				type: 'manual',
				message: 'Duração é obrigatória e deve ser maior que zero'
			})
			return
		}

		if (data.active === undefined) {
			form.setError('active', {
				type: 'manual',
				message: 'Por favor, selecione se o serviço está ativo ou inativo'
			})
			return
		}

		if (data.active && (data.points === undefined || data.points < 0)) {
			form.setError('points', {
				type: 'manual',
				message: 'Pontos são obrigatórios para serviços ativos'
			})
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const serviceData = {
				name: data.name,
				price: data.price!,
				duration: data.duration!,
				vehicle_type: data.vehicleType,
				points: data.points || 0,
				active: data.active!,
				company_id: 1
			}
			
			await servicesService.createService(serviceData)
			setSuccess(true)
			
			form.reset({
				name: '',
				price: undefined,
				duration: undefined,
				vehicleType: '',
				points: undefined,
				active: undefined
			})
			nav('/services')
			
		} catch (err: any) {
			console.error('Erro ao criar serviço:', err)
			setError(err.message || 'Erro ao criar serviço')
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
						{ label: 'Serviços', href: '/services' },
						{ label: 'Adicionar' }
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
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Nome do Serviço</FormLabel>
													<FormControl>
														<Input 
															placeholder="Ex: Lavagem Completa"
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
											name="duration"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Duração -  Minutos</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="1"
															max="480"
															placeholder="Digite a duração em minutos"
															{...field}
															value={field.value || ''}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const value = e.target.value
																if (value === '') {
																	field.onChange(undefined)
																} else {
																	field.onChange(parseInt(value) || undefined)
																}
															}}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Preço (R$)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															step="1"
															min="0"
															max="10000"
															placeholder="0,00"
															{...field}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="vehicleType"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Tipo de Veículo</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue placeholder="Selecione o tipo" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="car">Carro</SelectItem>
																<SelectItem value="motorcycle">Moto</SelectItem>
																<SelectItem value="truck">Caminhão</SelectItem>
																<SelectItem value="all">Todos</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className='space-y-4'>		
									<div className='grid grid-cols-2 md:grid-cols-2 gap-6'>
										
										<FormField
											control={form.control}
											name="active"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Serviço Ativo</FormLabel>
													<FormControl>
														<Select 
															value={field.value === undefined ? "" : field.value ? "true" : "false"} 
															onValueChange={(value: string) => field.onChange(value === "true")}
														>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue placeholder="Selecione" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="true">Ativo</SelectItem>
																<SelectItem value="false">Inativo</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="points"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>
														Pontos - Serviço
														
													</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															step="1"
															min="0"
															max="10000"
															placeholder={isActive ? "Digite os pontos" : "Desabilitado"}
															disabled={!isActive}
															{...field}
															value={field.value || ''}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																if (isActive) {
																	const value = e.target.value
																	if (value === '') {
																		field.onChange(undefined)
																	} else {
																		field.onChange(parseInt(value) || undefined)
																	}
																} else {
																	field.onChange(undefined)
																}
															}}
															className={`font-inter h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent ${
																isActive 
																	? 'bg-[#F6F6F7] text-black' 
																	: 'bg-gray-200 text-gray-500 cursor-not-allowed'
															}`}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>Erro ao criar serviço:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Serviço criado com sucesso!</p>
									</div>
								)}

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
										className='bg-gradient-to-r from-[#8E30F4] to-[#4645F8] hover:from-[#7C2BD9] hover:to-[#3B3FE6] text-white font-inter disabled:opacity-50 disabled:cursor-not-allowed'
									>
										{isLoading ? 'Criando...' : 'Adicionar'}
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
