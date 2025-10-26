'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ServiceResponse } from './service'

// Tipo para serviços da API
export type Service = ServiceResponse

export const columns = (
    onEdit?: (id: string) => void,
    onView?: (id: string) => void
): ColumnDef<Service>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    SERVIÇO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px] font-semibold'>{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    PREÇO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = row.getValue('price') as number
            return (
                <div className='pl-3 text-[15px]'>
                    R$ {price.toFixed(2).replace('.', ',')}
                </div>
            )
        },
    },
    {
        accessorKey: 'duration',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    DURAÇÃO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const duration = row.getValue('duration') as number
            return <div className='pl-3 text-[15px]'>{duration} min</div>
        },
    },
    {
        accessorKey: 'vehicle_type',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    TIPO DE VEÍCULO
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => {
            const vehicleType = row.getValue('vehicle_type') as string
            const vehicleConfig = {
                'car': { label: 'Carro', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
                'motorcycle': { label: 'Moto', bgColor: 'bg-green-100', textColor: 'text-green-800' },
                'truck': { label: 'Caminhão', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
                'all': { label: 'Todos', bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
            }
            const config = vehicleConfig[vehicleType as keyof typeof vehicleConfig] || { label: vehicleType, bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
            
            return (
                <div className='pl-3 text-[15px]'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                        {config.label}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'points',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='font-bold text-[12.5px] hover:bg-transparent'
                >
                    PONTOS
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
        cell: ({ row }) => <div className='pl-3 text-[15px]'>{row.getValue('points') || 0}</div>,
    },
    {
        accessorKey: 'active',
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
            const active = row.getValue('active') as boolean
            return (
                <div className='pl-3 text-[15px]'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {active ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const service = row.original
            return (
                <div className='flex justify-end items-center gap-2 mr-3'>
                    {onView && (
                        <div 
                            className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                            title='Visualizar Serviço'
                            onClick={() => onView(service.id?.toString() || '')}
                        >
                            <Eye className='h-5 w-5' strokeWidth={1.5} />
                        </div>
                    )}
                    {onEdit && (
                        <div 
                            className='h-10 w-10 flex items-center justify-center rounded hover:bg-muted cursor-pointer'
                            title='Editar Serviço'
                            onClick={() => onEdit(service.id?.toString() || '')}
                        >
                            <Pencil className='h-5 w-5' strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )
        },  
    },
]
