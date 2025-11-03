'use client'

import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil,
    Eye,
    Car,
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
import { type ClientResponse } from './service'
import { vehiclesService, type VehicleResponse } from '../vehicles/service'
import { useAuth } from '@/contexts/context'

// Tipo para clientes da API
export type Client = ClientResponse

// Componente interno para o drawer dos veículos
const VehiclesDrawer = ({ client }: { client: Client }) => {
    const { getUserData, isLoggedIn } = useAuth()
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
    const [loading, setLoading] = useState(true)

    const loadVehicles = async () => {
        try {
            setLoading(true)
            
            // Verificar se o usuário está logado
            if (!isLoggedIn()) {
                return
            }
            
            const userData = getUserData()
            if (!userData.company_id) {
                throw new Error('Company ID não encontrado no JWT')
            }
            
            const clientVehicles = await vehiclesService.getVehiclesByClient(userData.company_id, client.id.toString())
            setVehicles(clientVehicles)
        } catch (error) {
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
            <SheetHeader className="border-b relative">
                <SheetTitle className="text-lg font-bold pr-8">
                    {client.phone}
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
                        <span className="text-gray-500">Carregando veículos...</span>
                    </div>
                ) : vehicles && vehicles.length > 0 ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Dados do Veículo</h3>
                        </div>
                        <div className="bg-white">
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    {vehicles.map((vehicle, index) => (
                                        <React.Fragment key={vehicle.id}>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-gray-900 font-medium w-1/2 border-r border-gray-100">
                                                    {vehicle.model}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 font-medium w-1/2">
                                                    {vehicle.plate}
                                                </td>
                                            </tr>
                                            <tr className={index < vehicles.length - 1 ? 'border-b border-gray-100' : ''}>
                                                <td className="px-4 py-3 text-gray-900 w-1/2 border-r border-gray-100">
                                                    {vehicle.brand}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 w-1/2">
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
                                <Eye className='h-5 w-5 cursor-pointer' strokeWidth={1.5} />
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
