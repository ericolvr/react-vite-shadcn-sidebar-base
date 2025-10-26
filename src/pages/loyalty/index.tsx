import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DataTable } from './data-table'
import { columns, type LoyaltyAccount } from './columns'
import { Button } from '@/components/ui/button'
import { Loader2, MoveLeft, MoveRight, RefreshCw } from 'lucide-react'
import { loyaltyService } from './service'

export function Loyalty() {
	const nav = useNavigate()
	const [accounts, setAccounts] = useState<LoyaltyAccount[]>([])
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
		{ key: 'client_name', label: 'Cliente' },
		{ key: 'client_phone', label: 'Telefone' },
		{ key: 'current_points', label: 'Pontos Atuais' },
		{ key: 'total_earned', label: 'Total Ganho' },
		{ key: 'total_redeemed', label: 'Total Resgatado' },
		{ key: 'status', label: 'Status' },
	]

	const getLoyaltyAccounts = async (page: number = 1) => {
		try {
			setLoading(true)
			setError(null)
			
			const limit = 20
			const offset = (page - 1) * limit
			console.log(`🔍 Fazendo chamada: page=${page}, limit=${limit}, offset=${offset}`)
			const response = await loyaltyService.getLoyaltyAccounts(page, limit)
			console.log('📊 Resposta da API:', response)
			setAccounts(response.accounts || [])
			setPagination({
				page: response.page || 1,
				limit: response.limit || 20,
				total: response.total || 0,
				totalPages: Math.ceil((response.total || 0) / (response.limit || 20))
			})
			
		} catch (err: any) {
			const errorMessage = err.message || 'Erro ao listar contas de fidelidade'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (id: string) => {
		nav(`/loyalty/edit/${id}`)
	}

	const handleRefresh = () => {
		getLoyaltyAccounts(pagination.page)
	}

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			getLoyaltyAccounts(pagination.page - 1)
		}
	}

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			getLoyaltyAccounts(pagination.page + 1)
		}
	}

	useEffect(() => {
		getLoyaltyAccounts()
	}, [])

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='bg-white'>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Programa de Fidelidade' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-10 mb-8'>
					<div className='flex-1 bg-white'>
						{/* Header com título e ações */}
						<div className='flex justify-between items-center'>
							<div>
								<h1 className='text-2xl font-bold text-gray-900'>Programa de Fidelidade</h1>
								<p className='text-gray-600'>Contas criadas automaticamente quando agendamentos são completados</p>
							</div>
							<div className='flex gap-2'>
								<Button 
									onClick={() => nav('/loyalty/dashboard')} 
									className='bg-[#317CE5] hover:bg-[#2563eb]'
									size="sm"
								>
									📊 Dashboard
								</Button>
								<Button onClick={handleRefresh} variant="outline" size="sm">
									<RefreshCw className='h-4 w-4 mr-2' />
									Atualizar
								</Button>
							</div>
						</div>
						{loading ? (
							<div className='flex items-center justify-center h-64'>
								<Loader2 className='h-8 w-8 animate-spin' />
								<span className='ml-2 text-lg'>Carregando contas de fidelidade...</span>
							</div>
						) : error ? (
							<div className='flex flex-col items-center justify-center h-64'>
								<p className='text-red-500 text-lg mb-4'>{error}</p>
								<button 
									onClick={() => getLoyaltyAccounts()}
									className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
								>
									Tentar Novamente
								</button>
							</div>
						) : (
							<div className='rounded-sm'>
								<DataTable 
									columns={columns(handleEdit, handleRefresh)} 
									data={accounts || []}
									searchPlaceholder="Filtrar por nome do cliente..."
									searchColumn="client_name"
									addUrl="/loyalty/add"
									exportColumns={exportColumns}
									filename="contas-fidelidade"
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
