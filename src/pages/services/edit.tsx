import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { servicesService, type ServiceResponse } from './service'

// Schema de validação para serviços
const serviceSchema = z.object({
	name: z.string()
		.min(1, 'Nome é obrigatório')
		.max(100, 'Nome deve ter no máximo 100 caracteres'),
	
	price: z.number()
		.min(0, 'Preço deve ser positivo')
		.max(10000, 'Preço máximo é R$ 10.000'),
	
	duration: z.number()
		.min(1, 'Duração mínima é 1 minuto')
		.max(480, 'Duração máxima é 8 horas'),
	
	vehicle_type: z.string()
		.min(1, 'Tipo de veículo é obrigatório'),
	
	points: z.number()
		.min(0, 'Pontos devem ser positivos')
		.max(10000, 'Máximo 10.000 pontos'),
	
	active: z.boolean()
})

type ServiceForm = z.infer<typeof serviceSchema>

export function ServicesEdit() {
	const nav = useNavigate()
	const { id } = useParams<{ id: string }>()
	
	const form = useForm<ServiceForm>({
		resolver: zodResolver(serviceSchema),
		defaultValues: {
			name: '',
			price: 0,
			duration: 30,
			vehicle_type: '',
			points: 0,
			active: true
		}
	})

	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingService, setIsLoadingService] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [service, setService] = useState<ServiceResponse | null>(null)

	// Carregar dados do serviço
	useEffect(() => {
		const loadService = async () => {
			if (!id) {
				setError('ID do serviço não fornecido')
				setIsLoadingService(false)
				return
			}

			try {
				setIsLoadingService(true)
				const serviceData = await servicesService.getService(id)
				setService(serviceData)
				
				// Preencher o formulário com os dados do serviço
				form.reset({
					name: serviceData.name,
					price: serviceData.price,
					duration: serviceData.duration,
					vehicle_type: serviceData.vehicle_type,
					points: serviceData.points,
					active: serviceData.active
				})
			} catch (err: any) {
				console.error('Erro ao carregar serviço:', err)
				setError(err.message || 'Erro ao carregar serviço')
			} finally {
				setIsLoadingService(false)
			}
		}

		loadService()
	}, [id, form])

	const onSubmit = async (data: ServiceForm) => {
		if (!id) {
			setError('ID do serviço não fornecido')
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const serviceData = {
				name: data.name,
				price: data.price,
				duration: data.duration,
				vehicle_type: data.vehicle_type,
				points: data.points,
				active: data.active,
				company_id: service?.company_id || 1
			}
			
			await servicesService.updateService(id, serviceData)
			
			setSuccess(true)
			
			// Navegar imediatamente para a lista de serviços
			nav('/services')
			
		} catch (err: any) {
			console.error('Erro ao atualizar serviço:', err)
			setError(err.message || 'Erro ao atualizar serviço')
		} finally {
			setIsLoading(false)
		}
	}

	// Loading inicial
	if (isLoadingService) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Serviços', href: '/services' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='h-8 w-8 animate-spin' />
							<span className='ml-2 text-lg'>Carregando serviço...</span>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	// Erro no carregamento
	if (error && !service) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Serviços', href: '/services' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex flex-col items-center justify-center h-64'>
							<p className='text-red-500 text-lg mb-4'>{error}</p>
							<Button 
								onClick={() => nav('/services')}
								className='bg-[#317CE5] hover:bg-[#2563eb]'
							>
								Voltar para Serviços
							</Button>
						</div>
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
						{ label: 'Serviços', href: '/services' },
						{ label: 'Editar' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
								
								{/* Informações do Serviço */}
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
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Preço (R$)</FormLabel>
													<FormControl>
														<Input 
															type="number"
															step="0.01"
															placeholder="Ex: 25.00"
															{...field}
															value={field.value || ''}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const value = e.target.value
																if (value === '') {
																	field.onChange(0)
																} else {
																	field.onChange(parseFloat(value) || 0)
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

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="duration"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Duração (minutos)</FormLabel>
													<FormControl>
														<Input 
															type="number"
															placeholder="Ex: 30"
															{...field}
															value={field.value || ''}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const value = e.target.value
																if (value === '') {
																	field.onChange(0)
																} else {
																	field.onChange(parseInt(value) || 0)
																}
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
											name="vehicle_type"
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

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="points"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Pontos de Fidelidade</FormLabel>
													<FormControl>
														<Input 
															type="number"
															placeholder="Ex: 10"
															{...field}
															value={field.value || ''}
															onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																const value = e.target.value
																if (value === '') {
																	field.onChange(0)
																} else {
																	field.onChange(parseInt(value) || 0)
																}
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
											name="active"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="font-inter font-medium">Serviço Ativo</FormLabel>
														<div className="text-sm text-muted-foreground">
															Serviço disponível para agendamento
														</div>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Feedback Messages */}
								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>Erro ao atualizar serviço:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Serviço atualizado com sucesso!</p>
									</div>
								)}

								{/* Botões de Ação */}
								<div className='flex justify-end gap-4 pt-6 border-t'>
									<Button 
										type="button" 
										variant="outline"
										className='font-inter'
										onClick={() => nav('/services')}
									>
										Cancelar
									</Button>
									<Button 
										type="submit"
										disabled={isLoading}
										className='bg-[#317CE5] hover:bg-[#2563eb] font-inter disabled:opacity-50 disabled:cursor-not-allowed'
									>
										{isLoading ? 'Atualizando...' : 'Atualizar'}
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
