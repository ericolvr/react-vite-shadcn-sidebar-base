
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Settings, Trash2, Edit } from 'lucide-react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'


export function Tenants() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='bg-muted/70'>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Locatários'},
						
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 mx-8 pt-0 mt-1 mb-6'>
					<div className='min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-1 bg-white p-6 shadow-xs'>
						<div className='flex justify-between items-center gap-4 h-[40px]'>
							<div>
								<input 
									type='text' 
									placeholder='Search' 
									className='bg-muted/60 w-[400px] h-[40px] rounded-md pl-4 border border-gray-100 dark:border-[#3B3B3B] bg:ring-none focus:ring-none focus:border-none focus:outline-none' 
								/>	
							</div>

							<div>
								<ButtonGroup>
									<Button variant='outline' size='sm' className='h-[40px] px-6 shadow-none border-gray-100 bg-muted/60 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'>
										Adicionar
									</Button>
									<Button variant='outline' size='sm' className='h-[40px] px-6 shadow-none border-gray-100 bg-muted/60 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'>
										Filtros
									</Button>
									
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='outline' size='sm' className='h-[40px] shadow-none border-gray-100 bg-muted/60 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem>
												<Edit className='h-4 w-4 mr-2' />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Settings className='h-4 w-4 mr-2' />
												Settings
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className='text-red-600'>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</ButtonGroup>
							</div>
						</div>


						<Table className='mt-5'>
							<TableHeader className='bg-muted/60 rounded-md'>
								<TableRow>
									<TableHead>Nome</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Telefone</TableHead>
									<TableHead>Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>	
								<TableRow>
									<TableCell>John Doe</TableCell>
									<TableCell>john.doe@example.com</TableCell>
									<TableCell>+1 (555) 123-4567</TableCell>
									<TableCell>
										<Button variant='ghost' size='sm'>
											<MoreHorizontal className='h-4 w-4' />
										</Button>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>

					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
  	)
}
