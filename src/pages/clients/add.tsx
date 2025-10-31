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
import { clientsService } from './service'

// Schema de validação para clientes - alinhado com backend Client domain
const clientSchema = z.object({
	phone: z.string()
		.min(1, 'Telefone é obrigatório')
		.regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use: (11) 99999-9999'),
	
	role: z.number()
		.min(1, 'Tipo de cliente é obrigatório')
		.max(3, 'Tipo de cliente inválido')
})

type ClientForm = z.infer<typeof clientSchema>

export function ClientsAdd() {
	const nav = useNavigate()
	const form = useForm<ClientForm>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			phone: '',
			role: undefined
		}
	})

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const onSubmit = async (data: ClientForm) => {
		// Validação customizada para o campo role
		if (data.role === undefined) {
			form.setError('role', {
				type: 'manual',
				message: 'Tipo de cliente é obrigatório'
			})
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(false)

		try {
			// Mapear dados do formulário para o formato da API
			const clientData = {
				phone: data.phone,
				role: data.role,
				company_id: 1
			}
			
			await clientsService.createClient(clientData)
			setSuccess(true)
			
			form.reset({
				phone: '',
				role: undefined
			})
			nav('/clients')
			
		} catch (err: any) {
			console.error('Erro ao criar cliente:', err)
			setError(err.message || 'Erro ao criar cliente')
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
						{ label: 'Clientes', href: '/clients' },
						{ label: 'Adicionar' }
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
															placeholder="(11) 99999-9999"
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
															value={field.value === undefined ? "" : field.value.toString()} 
															onValueChange={(value: string) => field.onChange(parseInt(value))}
														>
															<SelectTrigger className="font-inter bg-[#F6F6F7] border-0 w-full h-[50px]">
																<SelectValue placeholder="Selecione o tipo" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="1">Master</SelectItem>
																<SelectItem value="2">Owner</SelectItem>
																<SelectItem value="3">Final Client</SelectItem>
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
										<p className='font-medium'>Erro ao criar cliente:</p>
										<p className='text-sm'>{error}</p>
									</div>
								)}
								
								{success && (
									<div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md'>
										<p className='font-medium'>✅ Cliente criado com sucesso!</p>
									</div>
								)}

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
