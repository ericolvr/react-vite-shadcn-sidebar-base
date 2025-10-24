import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema de validação para serviços
const serviceSchema = z.object({
	name: z.string()
		.min(1, 'Nome é obrigatório')
		.max(100, 'Nome deve ter no máximo 100 caracteres'),
	
	description: z.string()
		.min(1, 'Descrição é obrigatória')
		.max(500, 'Descrição deve ter no máximo 500 caracteres'),
	
	price: z.number()
		.min(0, 'Preço deve ser positivo')
		.max(10000, 'Preço máximo é R$ 10.000'),
	
	duration: z.number()
		.min(1, 'Duração mínima é 1 minuto')
		.max(480, 'Duração máxima é 8 horas'),
	
	category: z.string()
		.min(1, 'Categoria é obrigatória'),
	
	vehicleType: z.string()
		.min(1, 'Tipo de veículo é obrigatório'),
	
	active: z.string().default("true")
})

type ServiceForm = z.infer<typeof serviceSchema>

export function ServicesAdd() {
	const form = useForm<ServiceForm>({
		resolver: zodResolver(serviceSchema),
		defaultValues: {
			name: '',
			description: '',
			price: 0,
			duration: 30,
			category: '',
			vehicleType: '',
			active: "true"
		}
	})

	const onSubmit = (data: ServiceForm) => {
		console.log('Dados do serviço:', data)
		// Aqui você faria a chamada para a API
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
								
								{/* Informações Básicas */}
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
											name="category"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Categoria</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue placeholder="Selecione uma categoria" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="lavagem">Lavagem</SelectItem>
																<SelectItem value="enceramento">Enceramento</SelectItem>
																<SelectItem value="detalhamento">Detalhamento</SelectItem>
																<SelectItem value="manutencao">Manutenção</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel className='font-inter font-medium'>Descrição</FormLabel>
												<FormControl>
													<Textarea 
														placeholder="Descreva o serviço em detalhes..."
														{...field}
														className='font-inter bg-[#F6F6F7] min-h-[100px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent resize-none' 
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Configurações do Serviço */}
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
															step="0.01"
															min="0"
															max="10000"
															placeholder="0,00"
															{...field}
															onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
													<FormLabel className='font-inter font-medium'>Duração (minutos)</FormLabel>
													<FormControl>
														<Input 
															type="number" 
															min="1"
															max="480"
															placeholder="30"
															{...field}
															onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
															className='font-inter bg-[#F6F6F7] h-[50px] border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none focus:border-transparent' 
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Status */}
								<div className='space-y-4'>		
									<div className='grid grid-cols-2 md:grid-cols-2 gap-6'>

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
																<SelectItem value="carro">Carro</SelectItem>
																<SelectItem value="moto">Moto</SelectItem>
																<SelectItem value="caminhao">Caminhão</SelectItem>
																<SelectItem value="van">Van</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="active"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Serviço Ativo</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue />
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
									</div>
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
										Salvar Serviço
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
