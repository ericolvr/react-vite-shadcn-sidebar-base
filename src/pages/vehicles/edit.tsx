import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { vehiclesService, type VehicleResponse } from './service'

// Schema de validação para veículos
const vehicleSchema = z.object({
	brand: z.string()
		.min(1, 'Marca é obrigatória')
		.max(50, 'Marca deve ter no máximo 50 caracteres'),
	
	model: z.string()
		.min(1, 'Modelo é obrigatório')
		.max(50, 'Modelo deve ter no máximo 50 caracteres'),
	
	plate: z.string()
		.min(1, 'Placa é obrigatória')
		.max(10, 'Placa deve ter no máximo 10 caracteres'),
	
	type: z.string()
		.min(1, 'Tipo de veículo é obrigatório'),
	
	client_id: z.number()
		.min(1, 'Cliente é obrigatório')
})

type VehicleForm = z.infer<typeof vehicleSchema>

export function VehiclesEdit() {
	const nav = useNavigate()
	const { id } = useParams<{ id: string }>()
	
	const form = useForm<VehicleForm>({
		resolver: zodResolver(vehicleSchema),
		defaultValues: {
			brand: '',
			model: '',
			plate: '',
			type: '',
			client_id: undefined
		}
	})

	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingVehicle, setIsLoadingVehicle] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)

	// Carregar dados do veículo
	useEffect(() => {
		const loadVehicle = async () => {
			if (!id) {
				setError('ID do veículo não fornecido')
				setIsLoadingVehicle(false)
				return
			}

			try {
				setIsLoadingVehicle(true)
				const vehicleData = await vehiclesService.getVehicle(id)
				setVehicle(vehicleData)
				
				// Preencher o formulário com os dados do veículo
				form.reset({
					brand: vehicleData.brand,
					model: vehicleData.model,
					plate: vehicleData.plate,
					type: vehicleData.type,
					client_id: vehicleData.client_id
				})
			} catch (err: any) {
				console.error('Erro ao carregar veículo:', err)
				setError(err.message || 'Erro ao carregar veículo')
			} finally {
				setIsLoadingVehicle(false)
			}
		}

		loadVehicle()
	}, [id, form])

	const onSubmit = async (data: VehicleForm) => {
		if (!id) {
			setError('ID do veículo não fornecido')
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const vehicleData = {
				brand: data.brand,
				model: data.model,
				plate: data.plate,
				type: data.type,
				client_id: data.client_id,
				company_id: vehicle?.company_id || 1
			}
			
			await vehiclesService.updateVehicle(id, vehicleData)
			
			setSuccess(true)
			
			// Navegar imediatamente para a lista de veículos
			nav('/vehicles')
			
		} catch (err: any) {
			console.error('Erro ao atualizar veículo:', err)
			setError(err.message || 'Erro ao atualizar veículo')
		} finally {
			setIsLoading(false)
		}
	}

	// Loading inicial
	if (isLoadingVehicle) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Veículos', href: '/vehicles' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='h-8 w-8 animate-spin' />
							<span className='ml-2 text-lg'>Carregando veículo...</span>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	// Erro no carregamento
	if (error && !vehicle) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Veículos', href: '/vehicles' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex flex-col items-center justify-center h-64'>
							<p className='text-red-500 text-lg mb-4'>{error}</p>
							<Button 
								onClick={() => nav('/vehicles')}
								className='bg-[#317CE5] hover:bg-[#2563eb]'
							>
								Voltar para Veículos
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
						{ label: 'Veículos', href: '/vehicles' },
						{ label: 'Editar' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
								
								{/* Informações do Veículo */}
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="brand"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Marca</FormLabel>
													<FormControl>
														<Input 
															placeholder="Ex: Toyota"
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
											name="model"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Modelo</FormLabel>
													<FormControl>
														<Input 
															placeholder="Ex: Corolla"
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
											name="plate"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Placa</FormLabel>
													<FormControl>
														<Input 
															placeholder="Ex: ABC-1234"
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
											name="type"
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
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Campo client_id oculto - mantém o valor mas não exibe */}
									<FormField
										control={form.control}
										name="client_id"
										render={({ field }) => (
											<FormItem className="hidden">
												<FormControl>
													<Input 
														type="hidden"
														{...field}
														value={field.value || ''}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								{/* Feedback Messages */}
								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>Erro ao atualizar veículo:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Veículo atualizado com sucesso!</p>
									</div>
								)}

								{/* Botões de Ação */}
								<div className='flex justify-end gap-4 pt-6 border-t'>
									<Button 
										type="button" 
										variant="outline"
										className='font-inter'
										onClick={() => nav('/vehicles')}
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
