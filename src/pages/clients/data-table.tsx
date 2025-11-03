'use client'
import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'


interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	searchPlaceholder?: string
	searchColumn?: string
	addUrl?: string
	exportColumns?: { key: string; label: string }[]
	filename?: string
	// Server-side pagination props
	manualPagination?: boolean
	pageCount?: number
	onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
	onSearchChange?: (search: string) => void
	onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void
	loading?: boolean
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchPlaceholder = "Filtrar...",
	searchColumn = "phone",
	addUrl = "/services/add",
	manualPagination = false,
	pageCount = -1,
	onPaginationChange,
	onSearchChange,
	onSortingChange: onSortingChangeExternal,
	loading = false,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = React.useState({})
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 20,
	})

	// Handle sorting changes
	const handleSortingChange = React.useCallback((updater: any) => {
		setSorting(updater)
		if (onSortingChangeExternal && typeof updater === 'function') {
			const newSorting = updater(sorting)
			onSortingChangeExternal(newSorting)
		} else if (onSortingChangeExternal) {
			onSortingChangeExternal(updater)
		}
	}, [sorting, onSortingChangeExternal])

	// Handle pagination changes
	const handlePaginationChange = React.useCallback((updater: any) => {
		setPagination(updater)
		if (onPaginationChange && typeof updater === 'function') {
			const newPagination = updater(pagination)
			onPaginationChange(newPagination)
		} else if (onPaginationChange) {
			onPaginationChange(updater)
		}
	}, [pagination, onPaginationChange])

	const table = useReactTable({
		data,
		columns,
		pageCount: manualPagination ? pageCount : undefined,
		manualPagination,
		manualSorting: false, // Sempre permite ordenação local
		manualFiltering: false, // Sempre permite filtro local
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: handlePaginationChange,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
	})

	return (
		<div className='w-full space-y-4'>
			{/* Seção de Filtros e Botões */}
			<div>
				<div className='flex items-center justify-between'>
					<Input
						placeholder={searchPlaceholder}
						value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
						onChange={(event) => {
							const value = event.target.value
							if (manualPagination && onSearchChange) {
								onSearchChange(value)
							} else {
								table.getColumn(searchColumn)?.setFilterValue(value)
							}
						}}
						className='rounded-md max-w-sm h-[44px] bg-[#F9F9F9] border border-[#EFEFEF] outline-none focus:outline-none focus:ring-0 focus:border-[#EFEFEF] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none !shadow-none'
					/>

					<Link to={addUrl}>
						<Button className='bg-gradient-to-r from-[#8E30F4] to-[#4645F8] hover:from-[#7C2BD9] hover:to-[#3B3FE6] text-white h-[44px] px-6 cursor-pointer text-[14.5px]'>
							<Plus className="h-4 w-4" />
							<span className='pl-2 pr-4'>Adicionar</span>
						</Button>
					</Link>
				</div>
			</div>

			<div className='bg-white rounded-md overflow-hidden border border-[#EFEFEF]'>
			<Table>
				<TableHeader className='h-[60px] bg-[#F9F9F9]'>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="text-black text-[12px] font-bold border-b border-gray-100">
									{header.isPlaceholder
										? null
										: flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className='h-24 text-center text-[16px]'
							>
								<div className='flex items-center justify-center'>
									<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
									<span className='ml-2'>Carregando...</span>
								</div>
							</TableCell>
						</TableRow>
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								className='bg-white border-b border-gray-100'
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="py-[12px] px-3">
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className='h-24 text-center text-[16px]'
							>
								Nenhum serviço encontrado.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			</div>
			

		</div>
	)
}
