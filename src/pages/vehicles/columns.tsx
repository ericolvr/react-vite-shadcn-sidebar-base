'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { 
    ArrowUpDown, 
    Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type VehicleResponse } from './service'

// Tipo para veículos da API
export type Vehicle = VehicleResponse


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
        cell: ({ row }) => <div className='pl-3 text-[14px] font-semibold'>{row.getValue('plate')}</div>,
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
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const vehicle = row.original
            return (
                <div className='flex justify-end items-center gap-2 mr-3'>
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
