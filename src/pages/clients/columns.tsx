'use client'

import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil,
    Eye,
    Car,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { type ClientResponse } from './service'
import { vehiclesService, type VehicleResponse } from '../vehicles/service'

// Tipo para clientes da API
export type Client = ClientResponse

// Componente interno para o drawer dos veículos
const VehiclesDrawer = ({ client }: { client: Client }) => {
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
    const [loading, setLoading] = useState(true)

    const loadVehicles = async () => {
        try {
            setLoading(true)
            const clientVehicles = await vehiclesService.getVehiclesByClient(client.id.toString())
            setVehicles(clientVehicles)
        } catch (error) {
            console.error('Erro ao carregar veículos:', error)
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }

    // Carregar veículos automaticamente quando o drawer abrir
    React.useEffect(() => {
        loadVehicles()
    }, [client.id])

    return (
        <SheetContent side="right" className="w-[500px] sm:w-[540px]">
            <SheetHeader className="border-b pb-4 mb-6">
                {client.name}
                {/* <SheetTitle className="text-lg font-bold flex items-center gap-2">
                    {client.name}
                </SheetTitle> */}
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6">
                {loading ? (
                    <div className="flex items-center justify-center py-0">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        <span className="text-gray-500">Carregando veículos...</span>
                    </div>
                ) : vehicles.length > 0 ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        
                        <div className="bg-white">
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    {vehicles.map((vehicle, index) => (
                                        <React.Fragment key={vehicle.id}>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-900 font-medium w-1/2 border-r border-gray-100 bg-muted/50">
                                                    {vehicle.model}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 font-medium w-1/2 bg-muted/50">
                                                    {vehicle.plate}
                                                </td>
                                            </tr>
                                            <tr className={index < vehicles.length - 1 ? 'border-b' : ''}>
                                                <td className="px-4 py-3 text-gray-900 w-1/2 border-r border-gray-100 bg-muted/50">
                                                    {vehicle.brand}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 w-1/2 bg-muted/50">
                                                    {vehicle.type === 'car' ? 'Carro' : 
                                                     vehicle.type === 'motorcycle' ? 'Moto' : 
                                                     vehicle.type === 'truck' ? 'Caminhão' : 
                                                     vehicle.type}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Car className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo encontrado</h3>
                        <p className="text-gray-500">Este cliente ainda não possui veículos cadastrados.</p>
                    </div>
                )}
            </div>
        </SheetContent>
    )
}

export const columns = (
    onEdit?: (id: string) => void
): ColumnDef<Client>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    NOME
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px] font-semibold'>{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'phone',
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
            const phone = row.getValue('phone') as string
            // Formatar telefone: 11988259998 -> (11) 98825-9998
            const formatted = phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
            return <div className='pl-3 text-[15px]'>{formatted}</div>
        },
    },
    {
        accessorKey: 'address',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    ENDEREÇO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const address = row.getValue('address') as string
            return (
                <div className='pl-3 text-[15px] max-w-xs truncate' title={address}>
                    {address}
                </div>
            )
        },
    },
    {
        accessorKey: 'role',
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
            const role = row.getValue('role') as number
            const roleConfig = {
                1: { label: 'Cliente' },
                2: { label: 'VIP' },
                3: { label: 'Premium' }
            }
            const config = roleConfig[role as keyof typeof roleConfig] || { label: 'Cliente' }
            
            return (
                <div className='pl-3 text-[15px]'>
                    <span className="text-black">
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
            const client = row.original
            return (
                <div className='flex justify-end items-center gap-2 mr-3'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <div 
                                className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                                title='Ver Veículos'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Eye className='h-5 w-5' strokeWidth={1.5} />
                            </div>
                        </SheetTrigger>
                        <VehiclesDrawer client={client} />
                    </Sheet>
                    {onEdit && (
                        <div 
                            className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                            title='Editar Cliente'
                            onClick={() => onEdit(client.id?.toString() || '')}
                        >
                            <Pencil className='h-5 w-5' strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },  
    },
]
