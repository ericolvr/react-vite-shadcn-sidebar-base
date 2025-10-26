'use client'

import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil,
    Eye,
    User,
    Loader2,
    X
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
import { type VehicleResponse } from './service'
import { clientsService, type ClientResponse } from '../clients/service'

// Tipo para veículos da API
export type Vehicle = VehicleResponse

// Componente interno para o drawer do cliente do veículo
const ClientDrawer = ({ vehicle }: { vehicle: Vehicle }) => {
    const [client, setClient] = useState<ClientResponse | null>(null)
    const [loading, setLoading] = useState(true)

    const loadClient = async () => {
        try {
            setLoading(true)
            const vehicleClient = await clientsService.getClient(vehicle.client_id.toString())
            setClient(vehicleClient)
        } catch (error) {
            console.error('Erro ao carregar cliente:', error)
            setClient(null)
        } finally {
            setLoading(false)
        }
    }

    // Carregar cliente automaticamente quando o drawer abrir
    React.useEffect(() => {
        loadClient()
    }, [vehicle.client_id])

    return (
        <SheetContent side="right" className="w-[500px] sm:w-[540px]">
            <SheetHeader className="border-b relative">
                <SheetTitle className="text-lg font-bold pr-8">
                    {client?.name || 'Carregando...'}
                </SheetTitle>
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
                        <span className="text-gray-500">Carregando cliente...</span>
                    </div>
                ) : client ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Dados do Cliente</h3>
                        </div>
                        <div className="bg-white">
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-900 w-1/2 border-r border-gray-100">
                                            {client.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {client.phone ? client.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-900 w-full" colSpan={2}>
                                            {client.address || '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-900 w-full" colSpan={2}>
                                            {client.role === 1 ? 'Cliente' : client.role === 2 ? 'VIP' : client.role === 3 ? 'Premium' : 'Cliente'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <User className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente não encontrado</h3>
                        <p className="text-gray-500">Não foi possível carregar os dados do cliente.</p>
                    </div>
                )}
            </div>
        </SheetContent>
    )
}

export const columns = (
    onEdit?: (id: string) => void
): ColumnDef<Vehicle>[] => [
    {
        accessorKey: 'plate',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    PLACA
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px]'>{row.getValue('plate')}</div>,
    },
    {
        accessorKey: 'model',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    MODELO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px] font-semibold'>{row.getValue('model')}</div>,
    },
    {
        accessorKey: 'brand',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    MARCA
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px]'>{row.getValue('brand')}</div>,
    },

    {
        accessorKey: 'type',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    TIPO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const type = row.getValue('type') as string
            return (
                <div className='pl-3 text-[15px]'>
                    <span className="text-black">
                        {type === 'car' ? 'Carro' : 
                         type === 'motorcycle' ? 'Moto' : 
                         type === 'truck' ? 'Caminhão' : 
                         type}
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const vehicle = row.original
            return (
                <div className='flex justify-end items-center gap-2 mr-3'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <div 
                                className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                                title='Ver Cliente'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Eye className='h-5 w-5 cursor-pointer' strokeWidth={1.5} />
                            </div>
                        </SheetTrigger>
                        <ClientDrawer vehicle={vehicle} />
                    </Sheet>
                    {onEdit && (
                        <div 
                            className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                            title='Editar Veículo'
                            onClick={() => onEdit(vehicle.id?.toString() || '')}
                        >
                            <Pencil className='h-5 w-5' strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },  
    },
]
