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
import { clientsService, type ClientResponse } from './service'

// Schema de validação para clientes
const clientSchema = z.object({	
	phone: z.string()
		.min(1, 'Telefone é obrigatório')
		.max(20, 'Telefone deve ter no máximo 20 caracteres'),
	
	role: z.number()
		.min(1, 'Tipo de cliente é obrigatório')
		.max(3, 'Tipo de cliente inválido')
})

type ClientForm = z.infer<typeof clientSchema>

export function ClientsEdit() {
	const nav = useNavigate()
	const { id } = useParams<{ id: string }>()
	
	const form = useForm<ClientForm>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			phone: '',
			role: undefined
		}
	})

	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingClient, setIsLoadingClient] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [client, setClient] = useState<ClientResponse | null>(null)

	// Carregar dados do cliente
	useEffect(() => {
		const loadClient = async () => {
			if (!id) {
				setError('ID do cliente não fornecido')
				setIsLoadingClient(false)
				return
			}

			try {
				setIsLoadingClient(true)
				const clientData = await clientsService.getClient(id)
				setClient(clientData)
				
				// Preencher o formulário com os dados do cliente
				form.reset({
					phone: clientData.phone,
					role: clientData.role
				})
			} catch (err: any) {
				console.error('Erro ao carregar cliente:', err)
				setError(err.message || 'Erro ao carregar cliente')
			} finally {
				setIsLoadingClient(false)
			}
		}

		loadClient()
	}, [id, form])

	const onSubmit = async (data: ClientForm) => {
		if (!id) {
			setError('ID do cliente não fornecido')
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const clientData = {
				phone: data.phone,
				role: data.role,
				company_id: client?.company_id || 1
			}
			
			await clientsService.updateClient(id, clientData)
			
			setSuccess(true)
			
			// Navegar imediatamente para a lista de clientes
			nav('/clients')
			
		} catch (err: any) {
			console.error('Erro ao atualizar cliente:', err)
			setError(err.message || 'Erro ao atualizar cliente')
		} finally {
			setIsLoading(false)
		}
	}

	// Loading inicial
	if (isLoadingClient) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Clientes', href: '/clients' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='h-8 w-8 animate-spin' />
							<span className='ml-2 text-lg'>Carregando cliente...</span>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}

	// Erro no carregamento
	if (error && !client) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Clientes', href: '/clients' },
							{ label: 'Editar' }
						]}
					/>
					<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
						<div className='flex flex-col items-center justify-center h-64'>
							<p className='text-red-500 text-lg mb-4'>{error}</p>
							<Button 
								onClick={() => nav('/clients')}
								className='bg-[#317CE5] hover:bg-[#2563eb]'
							>
								Voltar para Clientes
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
						{ label: 'Clientes', href: '/clients' },
						{ label: 'Editar' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
								
								{/* Informações do Cliente */}
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Telefone</FormLabel>
													<FormControl>
														<Input 
															placeholder="Ex: (11) 99999-9999"
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
											name="role"
											render={({ field }) => (
												<FormItem>
													<FormLabel className='font-inter font-medium'>Tipo de Cliente</FormLabel>
													<FormControl>
														<Select 
															value={field.value?.toString()} 
															onValueChange={(value: string) => field.onChange(parseInt(value))}
														>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue placeholder="Selecione o tipo" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="1">Cliente</SelectItem>
																<SelectItem value="2">VIP</SelectItem>
																<SelectItem value="3">Premium</SelectItem>
															</SelectContent>
														</Select>
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
										<p className='font-medium'>Erro ao atualizar cliente:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Cliente atualizado com sucesso!</p>
									</div>
								)}

								{/* Botões de Ação */}
								<div className='flex justify-end gap-4 pt-6 border-t'>
									<Button 
										type="button" 
										variant="outline"
										className='font-inter'
										onClick={() => nav('/clients')}
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
