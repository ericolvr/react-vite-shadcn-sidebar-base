'use client'

import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil,
    Eye,
    Gift,
    Loader2,
    X,
    Plus,
    Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type LoyaltyAccountResponse, type PointsTransactionResponse, loyaltyService } from './service'

// Tipo para contas de fidelidade da API
export type LoyaltyAccount = LoyaltyAccountResponse

// Componente interno para o drawer do histórico de pontos
const PointsHistoryDrawer = ({ account }: { account: LoyaltyAccount }) => {
    const [transactions, setTransactions] = useState<PointsTransactionResponse[]>([])
    const [loading, setLoading] = useState(true)

    const loadTransactions = async () => {
        try {
            setLoading(true)
            const accountTransactions = await loyaltyService.getPointsHistory(account.id.toString())
            setTransactions(accountTransactions)
        } catch (error) {
            console.error('Erro ao carregar histórico de pontos:', error)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    // Carregar transações automaticamente quando o drawer abrir
    React.useEffect(() => {
        loadTransactions()
    }, [account.id])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTransactionTypeLabel = (type: string) => {
        const types = {
            'earned': 'Ganhou',
            'redeemed': 'Resgatou',
            'expired': 'Expirou',
            'adjusted': 'Ajuste'
        }
        return types[type as keyof typeof types] || type
    }

    const getTransactionTypeColor = (type: string) => {
        const colors = {
            'earned': 'text-green-600',
            'redeemed': 'text-red-600',
            'expired': 'text-gray-600',
            'adjusted': 'text-blue-600'
        }
        return colors[type as keyof typeof colors] || 'text-gray-600'
    }

    return (
        <SheetContent side="right" className="w-[600px] sm:w-[640px]">
            <SheetHeader className="border-b relative">
                <SheetTitle className="text-lg font-bold pr-8">
                    {account.client_name} - Histórico de Pontos
                </SheetTitle>
                <div className="text-sm text-gray-600">
                    Pontos Atuais: <span className="font-semibold text-blue-600">{account.current_points}</span>
                </div>
                <SheetClose asChild>
                    <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </button>
                </SheetClose>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        <span className="text-gray-500">Carregando histórico...</span>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                                            {getTransactionTypeLabel(transaction.type)}
                                        </span>
                                        <span className="font-bold text-lg">
                                            {transaction.type === 'redeemed' ? '-' : '+'}{transaction.points} pts
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(transaction.created_at)}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm">{transaction.description}</p>
                                {transaction.reference_type && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Ref: {transaction.reference_type} #{transaction.reference_id}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Gift className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                        <p className="text-gray-500">Esta conta ainda não possui histórico de pontos.</p>
                    </div>
                )}
            </div>
        </SheetContent>
    )
}

// Componente para modal de adicionar/remover pontos
const PointsModal = ({ 
    account, 
    type, 
    isOpen, 
    onClose, 
    onSuccess 
}: { 
    account: LoyaltyAccount
    type: 'add' | 'redeem'
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}) => {
    const [points, setPoints] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!points || !description) return

        try {
            setLoading(true)
            if (type === 'add') {
                await loyaltyService.addPoints(account.id.toString(), parseInt(points), description)
            } else {
                await loyaltyService.redeemPoints(account.id.toString(), parseInt(points), description)
            }
            onSuccess()
            onClose()
            setPoints('')
            setDescription('')
        } catch (error) {
            console.error('Erro ao processar pontos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'add' ? 'Adicionar Pontos' : 'Resgatar Pontos'}
                    </DialogTitle>
                    <DialogDescription>
                        {account.client_name} - Pontos atuais: {account.current_points}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="points">Quantidade de Pontos</Label>
                        <Input
                            id="points"
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="Digite a quantidade"
                            min="1"
                            max={type === 'redeem' ? account.current_points : undefined}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Motivo da transação"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {type === 'add' ? 'Adicionar' : 'Resgatar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export const columns = (
    onEdit?: (id: string) => void,
    onRefresh?: () => void
): ColumnDef<LoyaltyAccount>[] => [
    {
        accessorKey: 'client_name',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    CLIENTE
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px] font-semibold'>{row.getValue('client_name')}</div>,
    },
    {
        accessorKey: 'client_phone',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    TELEFONE
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const phone = row.getValue('client_phone') as string
            // Formatar telefone: 11988259998 -> (11) 98825-9998
            const formatted = phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
            return <div className='pl-3 text-[15px]'>{formatted}</div>
        },
    },
    {
        accessorKey: 'current_points',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    PONTOS ATUAIS
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const points = row.getValue('current_points') as number
            return (
                <div className='pl-3 text-[15px] font-semibold text-blue-600'>
                    {points.toLocaleString()} pts
                </div>
            )
        },
    },
    {
        accessorKey: 'total_earned',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    TOTAL GANHO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const points = row.getValue('total_earned') as number
            return (
                <div className='pl-3 text-[15px] text-green-600'>
                    {points.toLocaleString()} pts
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    STATUS
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const statusConfig = {
                'active': { label: 'Ativo', color: 'text-green-600' },
                'inactive': { label: 'Inativo', color: 'text-gray-600' },
                'suspended': { label: 'Suspenso', color: 'text-red-600' }
            }
            const config = statusConfig[status as keyof typeof statusConfig] || { label: 'Ativo', color: 'text-green-600' }
            
            return (
                <div className='pl-3 text-[15px]'>
                    <span className={config.color}>
                        {config.label}
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const account = row.original
            const [addModalOpen, setAddModalOpen] = useState(false)
            const [redeemModalOpen, setRedeemModalOpen] = useState(false)

            return (
                <div className='flex justify-end items-center gap-2 mr-3'>
                    {/* Histórico de Pontos */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <div 
                                className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                                title='Ver Histórico'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Eye className='h-5 w-5 cursor-pointer' strokeWidth={1.5} />
                            </div>
                        </SheetTrigger>
                        <PointsHistoryDrawer account={account} />
                    </Sheet>

                    {/* Adicionar Pontos */}
                    <div 
                        className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                        title='Adicionar Pontos'
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className='h-5 w-5 text-green-600' strokeWidth={1.5} />
                    </div>

                    {/* Resgatar Pontos */}
                    <div 
                        className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                        title='Resgatar Pontos'
                        onClick={() => setRedeemModalOpen(true)}
                    >
                        <Minus className='h-5 w-5 text-red-600' strokeWidth={1.5} />
                    </div>

                    {/* Editar Conta */}
                    {onEdit && (
                        <div 
                            className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                            title='Editar Conta'
                            onClick={() => onEdit(account.id?.toString() || '')}
                        >
                            <Pencil className='h-5 w-5' strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Modais */}
                    <PointsModal
                        account={account}
                        type="add"
                        isOpen={addModalOpen}
                        onClose={() => setAddModalOpen(false)}
                        onSuccess={() => onRefresh?.()}
                    />
                    <PointsModal
                        account={account}
                        type="redeem"
                        isOpen={redeemModalOpen}
                        onClose={() => setRedeemModalOpen(false)}
                        onSuccess={() => onRefresh?.()}
                    />
                </div>
            )
        },  
    },
]
