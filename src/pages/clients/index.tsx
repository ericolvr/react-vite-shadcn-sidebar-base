import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DataTable } from './data-table'
import { columns, type Client } from './columns'
import { Loader2, MoveLeft, MoveRight } from 'lucide-react'
import { clientsService } from './service'
import { useAuth } from '../../contexts/context'

export function Clients() {
	const nav = useNavigate()
	const { getUserData, isLoggedIn } = useAuth()
	const [clients, setClients] = useState<Client[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0
	})

	// Colunas para exportação CSV
	const exportColumns = [
		{ key: 'id', label: 'ID' },
		{ key: 'phone', label: 'Telefone' },
		{ key: 'role', label: 'Tipo' },
	]

	const getClients = async (page: number = 1) => {
		try {
			setLoading(true)
			setError(null)
			
			// Verificar se o usuário está logado
			if (!isLoggedIn()) {
				console.error('❌ Clients: Usuário não está logado')
				nav('/')
				return
			}
			
			const userData = getUserData()
			console.log('🔍 Clients: Dados do usuário (do JWT):', userData)
			
			if (!userData.company_id) {
				console.error('❌ Clients: Company ID não encontrado no JWT')
				throw new Error(`Company ID não encontrado no JWT. Dados: ${JSON.stringify(userData)}`)
			}
			
			const limit = 20
			console.log('📡 Clients: Fazendo requisição com company_id do JWT:', userData.company_id)
			const response = await clientsService.getClients(userData.company_id, page, limit)
			console.log('📊 Resposta da API:', response)
			setClients(response.clients)
			setPagination({
				page: response.page,
				limit: response.limit,
				total: response.total,
				totalPages: Math.ceil(response.total / response.limit)
			})
			
		} catch (err: any) {
			const errorMessage = err.message || 'Erro ao listar clientes'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (id: string) => {
		nav(`/clients/edit/${id}`)
	}

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			getClients(pagination.page - 1)
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			getClients(pagination.page + 1)
		}
	}

	useEffect(() => {
		getClients()
	}, [])

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='bg-white'>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Clientes' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						{loading ? (
							<div className='flex items-center justify-center h-64'>
								<Loader2 className='h-8 w-8 animate-spin' />
								<span className='ml-2 text-lg'>Carregando clientes...</span>
							</div>
						) : error ? (
							<div className='flex flex-col items-center justify-center h-64'>
								<p className='text-red-500 text-lg mb-4'>{error}</p>
								<button 
									onClick={() => getClients()}
									className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
								>
									Tentar Novamente
								</button>
							</div>
						) : (
							<div className='rounded-sm'>
								<DataTable 
									columns={columns(handleEdit)} 
									data={clients}
									searchPlaceholder="Filtrar por telefone..."
									searchColumn="phone"
									addUrl="/clients/add"
									exportColumns={exportColumns}
									filename="clientes"
									loading={loading}
								/>
								
								{/* Botões de Paginação - só aparecem se total > 20 */}
								{pagination.total > 20 && (
									<div className="flex justify-end items-center gap-2 mt-6 mb-4">
										<button
											onClick={handlePreviousPage}
											disabled={pagination.page <= 1 || loading}
											className="flex items-center gap-2 px-4 py-2 bg-[#317CE5] text-white text-sm rounded-md hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<MoveLeft className="h-4 w-4" />
											Anterior
										</button>
										<button
											onClick={handleNextPage}
											disabled={pagination.page >= pagination.totalPages || loading}
											className="flex items-center gap-2 px-4 py-2 bg-[#317CE5] text-white text-sm rounded-md hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											Próximo
											<MoveRight className="h-4 w-4" />
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
  	)
}
