import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DataTable } from './data-table'
import { columns, type Service } from './columns'
import { Loader2, MoveLeft, MoveRight } from 'lucide-react'
import { servicesService } from './service'
import { useAuth } from '@/contexts/context'

export function Services() {
	const nav = useNavigate()
	const { getUserData, isLoggedIn, isLoading: authLoading } = useAuth()
	const [services, setServices] = useState<Service[]>([])
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
		{ key: 'name', label: 'Nome' },
		{ key: 'price', label: 'Preço' },
		{ key: 'duration', label: 'Duração' },
		{ key: 'vehicleType', label: 'Tipo de Veículo' },
		{ key: 'points', label: 'Pontos' },
		{ key: 'active', label: 'Status' },
	]

	const getServices = async (page: number = 1) => {
		try {
			setLoading(true)
			setError(null)
			
			const limit = 20
			const offset = (page - 1) * limit
			console.log(`🔍 Fazendo chamada: page=${page}, limit=${limit}, offset=${offset}`)
			
			// Verificar se o usuário está logado
			if (!isLoggedIn()) {
				console.error('❌ Services: Usuário não está logado')
				nav('/')
				return
			}
			
			const userData = getUserData()
			console.log('🔍 Services: Dados do usuário (do JWT):', userData)
			
			if (!userData.company_id) {
				console.error('❌ Services: Company ID não encontrado no JWT')
				throw new Error(`Company ID não encontrado no JWT. Dados: ${JSON.stringify(userData)}`)
			}
			
			console.log('📡 Services: Fazendo requisição com company_id do JWT:', userData.company_id)
			const response = await servicesService.getServices(userData.company_id, page, limit)
			console.log('📊 Resposta da API:', response)
			setServices(response.services)
			setPagination({
				page: response.page,
				limit: response.limit,
				total: response.total,
				totalPages: Math.ceil(response.total / response.limit)
			})
			
		} catch (err: any) {
			const errorMessage = err.message || 'Erro ao listar serviços'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (id: string) => {
		nav(`/services/edit/${id}`)
	}

	const handleView = (id: string) => {
		console.log('Visualizar serviço:', id)
		// TODO: Implementar navegação para visualização
	}

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			getServices(pagination.page - 1)
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			getServices(pagination.page + 1)
		}
	}

	useEffect(() => {
		// Aguardar o contexto ser inicializado antes de carregar dados
		if (!authLoading) {
			getServices()
		}
	}, [authLoading])

	// Mostrar loading enquanto o contexto está sendo inicializado
	if (authLoading) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className='bg-white'>
					<Header 
						breadcrumbs={[
							{ label: 'Dashboard', href: '/dashboard' },
							{ label: 'Serviços' }
						]}
					/>
					<div className='flex items-center justify-center h-64'>
						<Loader2 className='h-8 w-8 animate-spin' />
						<span className='ml-2 text-lg'>Inicializando...</span>
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
						{ label: 'Serviços' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						{loading ? (
							<div className='flex items-center justify-center h-64'>
								<Loader2 className='h-8 w-8 animate-spin' />
								<span className='ml-2 text-lg'>Carregando serviços...</span>
							</div>
						) : error ? (
							<div className='flex flex-col items-center justify-center h-64'>
								<p className='text-red-500 text-lg mb-4'>{error}</p>
								<button 
									onClick={() => getServices()}
									className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
								>
									Tentar Novamente
								</button>
							</div>
						) : (
							<div className='rounded-sm'>
								<DataTable 
									columns={columns(handleEdit, handleView)} 
									data={services}
									searchPlaceholder="Filtrar por nome do serviço..."
									searchColumn="name"
									addUrl="/services/add"
									exportColumns={exportColumns}
									filename="servicos"
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
