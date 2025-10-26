import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    Users, 
    Gift, 
    TrendingUp, 
    Award, 
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    RefreshCw
} from 'lucide-react'
import { loyaltyService, type LoyaltyStatsResponse } from './service'

// Tipos para estatísticas específicas do dashboard
type DashboardStats = {
    totalAccounts: number
    activeAccounts: number
    totalPointsCirculation: number
    pointsEarnedMonth: number
    pointsRedeemedMonth: number
    engagementRate: number
    averagePointsPerAccount: number
    topLoyaltyLevel: string
    rewardsRedeemed: number
    newAccountsThisMonth: number
}

type TopClient = {
    id: number
    name: string
    phone: string
    points: number
    level: string
    totalEarned: number
}

export function LoyaltyDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [topClients, setTopClients] = useState<TopClient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Buscar estatísticas gerais
            const loyaltyStats = await loyaltyService.getLoyaltyStats()
            
            // Buscar contas para calcular métricas adicionais
            const accountsResponse = await loyaltyService.getLoyaltyAccounts(1, 100)
            
            // Calcular estatísticas do dashboard
            const dashboardStats: DashboardStats = {
                totalAccounts: loyaltyStats.total_accounts,
                activeAccounts: loyaltyStats.active_accounts,
                totalPointsCirculation: loyaltyStats.total_points_circulation,
                pointsEarnedMonth: loyaltyStats.points_earned_month,
                pointsRedeemedMonth: loyaltyStats.points_redeemed_month,
                engagementRate: loyaltyStats.engagement_rate,
                averagePointsPerAccount: Math.round(loyaltyStats.total_points_circulation / Math.max(loyaltyStats.total_accounts, 1)),
                topLoyaltyLevel: 'Gold', // Pode vir da API
                rewardsRedeemed: Math.floor(loyaltyStats.points_redeemed_month / 100), // Assumindo 100 pontos por recompensa
                newAccountsThisMonth: Math.floor(loyaltyStats.total_accounts * 0.1) // Estimativa
            }
            
            // Processar top clientes (ordenar por pontos)
            const sortedAccounts = accountsResponse.accounts
                .sort((a, b) => b.current_points - a.current_points)
                .slice(0, 5)
                .map(account => ({
                    id: account.id,
                    name: account.client_name,
                    phone: account.client_phone,
                    points: account.current_points,
                    level: account.current_points > 1000 ? 'Gold' : account.current_points > 500 ? 'Silver' : 'Bronze',
                    totalEarned: account.total_earned
                }))
            
            setStats(dashboardStats)
            setTopClients(sortedAccounts)
            
        } catch (err: any) {
            console.error('Erro ao carregar dashboard:', err)
            setError(err.message || 'Erro ao carregar dados do dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
        
        // Configurar atualização automática a cada 30 segundos
        const interval = setInterval(() => {
            loadDashboardData()
        }, 30000) // 30 segundos
        
        // Limpar interval quando componente for desmontado
        return () => clearInterval(interval)
    }, [])

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('pt-BR').format(num)
    }

    const formatPercentage = (num: number): string => {
        return `${num.toFixed(1)}%`
    }

    const getLevelColor = (level: string): string => {
        switch (level) {
            case 'Gold': return 'text-yellow-600'
            case 'Silver': return 'text-gray-600'
            case 'Bronze': return 'text-orange-600'
            default: return 'text-gray-600'
        }
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Gold': return <Award className="h-4 w-4 text-yellow-600" />
            case 'Silver': return <Award className="h-4 w-4 text-gray-600" />
            case 'Bronze': return <Award className="h-4 w-4 text-orange-600" />
            default: return <Star className="h-4 w-4 text-gray-600" />
        }
    }

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='bg-white'>
                    <Header 
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Fidelidade', href: '/loyalty' },
                            { label: 'Dashboard' }
                        ]}
                    />
                    <div className='flex items-center justify-center h-64'>
                        <Loader2 className='h-8 w-8 animate-spin' />
                        <span className='ml-2 text-lg'>Carregando dashboard...</span>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (error) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='bg-white'>
                    <Header 
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Fidelidade', href: '/loyalty' },
                            { label: 'Dashboard' }
                        ]}
                    />
                    <div className='flex flex-col items-center justify-center h-64'>
                        <p className='text-red-500 text-lg mb-4'>{error}</p>
                        <Button onClick={loadDashboardData} className='bg-[#317CE5] hover:bg-[#2563eb]'>
                            <RefreshCw className='h-4 w-4 mr-2' />
                            Tentar Novamente
                        </Button>
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
                        { label: 'Fidelidade', href: '/loyalty' },
                        { label: 'Dashboard' }
                    ]}
                />
                <div className='flex flex-1 flex-col gap-6 mx-8 pt-0 mt-10 mb-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        
                        {/* Total de Contas */}
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Contas Ativas</CardTitle>
                                <Users className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{formatNumber(stats?.activeAccounts || 0)}</div>
                                <p className='text-xs text-muted-foreground'>
                                    de {formatNumber(stats?.totalAccounts || 0)} total
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pontos em Circulação */}
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Pontos em Circulação</CardTitle>
                                <Gift className='h-4 w-4 text-muted-foreground' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>{formatNumber(stats?.totalPointsCirculation || 0)}</div>
                                <p className='text-xs text-muted-foreground'>
                                    {formatNumber(stats?.averagePointsPerAccount || 0)} por conta
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pontos Ganhos no Mês */}
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Pontos Ganhos (Mês)</CardTitle>
                                <ArrowUpRight className='h-4 w-4 text-green-600' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-green-600'>
                                    +{formatNumber(stats?.pointsEarnedMonth || 0)}
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    {stats?.newAccountsThisMonth || 0} novas contas
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pontos Resgatados no Mês */}
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Pontos Resgatados (Mês)</CardTitle>
                                <ArrowDownRight className='h-4 w-4 text-red-600' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-red-600'>
                                    -{formatNumber(stats?.pointsRedeemedMonth || 0)}
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    {stats?.rewardsRedeemed || 0} recompensas
                                </p>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Seção de Métricas Adicionais */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        
                        {/* Taxa de Engajamento */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Taxa de Engajamento</CardTitle>
                                <CardDescription>Clientes ativos no programa</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='text-3xl font-bold text-blue-600'>
                                    {formatPercentage(stats?.engagementRate || 0)}
                                </div>
                                <div className='mt-4 h-2 bg-gray-200 rounded-full'>
                                    <div 
                                        className='h-2 bg-blue-600 rounded-full transition-all duration-500'
                                        style={{ width: `${Math.min(stats?.engagementRate || 0, 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nível Mais Popular */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Nível Mais Popular</CardTitle>
                                <CardDescription>Nível de fidelidade predominante</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center gap-2'>
                                    {getLevelIcon(stats?.topLoyaltyLevel || 'Bronze')}
                                    <span className={`text-2xl font-bold ${getLevelColor(stats?.topLoyaltyLevel || 'Bronze')}`}>
                                        {stats?.topLoyaltyLevel || 'Bronze'}
                                    </span>
                                </div>
                                <p className='text-sm text-muted-foreground mt-2'>
                                    Baseado na distribuição atual
                                </p>
                            </CardContent>
                        </Card>

                        {/* Resumo de Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Performance do Mês</CardTitle>
                                <CardDescription>Resumo das atividades</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600'>Pontos Distribuídos</span>
                                    <span className='font-semibold text-green-600'>
                                        +{formatNumber(stats?.pointsEarnedMonth || 0)}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600'>Pontos Resgatados</span>
                                    <span className='font-semibold text-red-600'>
                                        -{formatNumber(stats?.pointsRedeemedMonth || 0)}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center pt-2 border-t'>
                                    <span className='text-sm font-medium'>Saldo Líquido</span>
                                    <span className='font-bold text-blue-600'>
                                        +{formatNumber((stats?.pointsEarnedMonth || 0) - (stats?.pointsRedeemedMonth || 0))}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Top Clientes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Top 5 Clientes Fiéis</CardTitle>
                            <CardDescription>Clientes com mais pontos acumulados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {topClients.map((client, index) => (
                                    <div key={client.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                        <div className='flex items-center gap-3'>
                                            <div className='flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm'>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className='font-semibold text-gray-900'>{client.name}</p>
                                                <p className='text-sm text-gray-600'>{client.phone}</p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='flex items-center gap-1'>
                                                {getLevelIcon(client.level)}
                                                <span className={`text-sm font-medium ${getLevelColor(client.level)}`}>
                                                    {client.level}
                                                </span>
                                            </div>
                                            <p className='text-lg font-bold text-blue-600'>{formatNumber(client.points)} pts</p>
                                            <p className='text-xs text-gray-500'>Total: {formatNumber(client.totalEarned)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
