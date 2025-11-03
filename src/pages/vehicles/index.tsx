import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DataTable } from './data-table'
import { columns, type Vehicle } from './columns'
import { Loader2, MoveLeft, MoveRight } from 'lucide-react'
import { vehiclesService } from './service'
import { useAuth } from '../../contexts/context'


export function Vehicles() {
	const nav = useNavigate()
	const { getUserData, isLoggedIn, isLoading: authLoading } = useAuth()
	const [vehicles, setVehicles] = useState<Vehicle[]>([])
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
		{ key: 'model', label: 'Modelo' },
		{ key: 'brand', label: 'Marca' },
		{ key: 'plate', label: 'Placa' },
		{ key: 'type', label: 'Tipo' },
	]

	const getVehicles = async (page: number = 1) => {
		try {
			setLoading(true)
			setError(null)
			
			// Verificar se o usuário está logado
			if (!isLoggedIn()) {
				console.error('❌ Vehicles: Usuário não está logado')
				nav('/')
				return
			}
			
			const userData = getUserData()
			console.log('🔍 Vehicles: Dados do usuário (do JWT):', userData)
			
			if (!userData.company_id) {
				console.error('❌ Vehicles: Company ID não encontrado no JWT')
				throw new Error(`Company ID não encontrado no JWT. Dados: ${JSON.stringify(userData)}`)
			}
			
			const limit = 20
			console.log('📡 Vehicles: Fazendo requisição com company_id do JWT:', userData.company_id)
			const response = await vehiclesService.getVehicles(userData.company_id, page, limit)
			console.log('📊 Resposta da API:', response)
			setVehicles(response.vehicles)
			setPagination({
				page: response.page,
				limit: response.limit,
				total: response.total,
				totalPages: Math.ceil(response.total / response.limit)
			})
			
		} catch (err: any) {
			const errorMessage = err.message || 'Erro ao listar veículos'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (id: string) => {
		
		nav(`/vehicles/edit/${id}`)
	}

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			getVehicles(pagination.page - 1)
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			getVehicles(pagination.page + 1)
		}
	}

	useEffect(() => {
		// Aguardar o contexto ser inicializado antes de carregar dados
		if (!authLoading) {
			getVehicles()
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
							{ label: 'Veículos' }
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
						{ label: 'Veículos' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						{loading ? (
							<div className='flex items-center justify-center h-64'>
								<Loader2 className='h-8 w-8 animate-spin' />
								<span className='ml-2 text-lg'>Carregando veículos...</span>
							</div>
						) : error ? (
							<div className='flex flex-col items-center justify-center h-64'>
								<p className='text-red-500 text-lg mb-4'>{error}</p>
								<button 
									onClick={() => getVehicles()}
									className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
								>
									Tentar Novamente
								</button>
							</div>
						) : (
							<div className='rounded-sm'>
								<DataTable 
									columns={columns(handleEdit)} 
									data={vehicles}
									searchPlaceholder="Filtrar por placa do veículo..."
									searchColumn="plate"
									addUrl="/vehicles/add"
									exportColumns={exportColumns}
									filename="veiculos"
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
