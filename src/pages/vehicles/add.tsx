import { useState } from 'react'
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
import { vehiclesService } from './service'

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

export function VehiclesAdd() {
	const nav = useNavigate()
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
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const onSubmit = async (data: VehicleForm) => {
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
				company_id: 1
			}
			
			await vehiclesService.createVehicle(vehicleData)
			
			setSuccess(true)
			
			form.reset({
				brand: '',
				model: '',
				plate: '',
				type: '',
				client_id: undefined
			})
			nav('/vehicles')
			
		} catch (err: any) {
			console.error('Erro ao criar veículo:', err)
			setError(err.message || 'Erro ao criar veículo')
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
						{ label: 'Veículos', href: '/vehicles' },
						{ label: 'Adicionar' }
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

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="client_id"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>ID do Cliente</FormLabel>
													<FormControl>
														<Input 
															type="number"
															placeholder="Digite o ID do cliente"
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

								{/* Feedback Messages */}
								{error && (
									<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>Erro ao criar veículo:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Veículo criado com sucesso!</p>
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
