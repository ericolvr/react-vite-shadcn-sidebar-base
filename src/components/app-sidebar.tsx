'use client'

import * as React from 'react'
import {
	Bubbles,
	Calendar,
	CarFront,
	CircleGauge,
	Frame,
	Layers2,
	Map,
	PieChart,
	Settings2,
	Users,
} from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation()
	
	return (
    	<Sidebar collapsible='icon' {...props}>
      		<SidebarHeader>
        		<div className='mx-2 mt-2 group-data-[collapsible=icon]:ml-4 flex items-center gap-4'>
					<div className='flex h-8 w-8 items-center justify-center ml-3'>
						<Bubbles className='h-6 w-6 text-black' />
					</div>
					<div className='grid flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-semibold font-inter'>Lava Logo</span>
					</div>
				</div>
      		</SidebarHeader>
			
			<div className='mt-2 mb-4 mx-9 h-[1px] bg-[#E5E7EB]'/>

			<SidebarContent className='mx-3'>
				<SidebarGroup>
					<SidebarGroupLabel>Operacional</SidebarGroupLabel>
					<SidebarMenu>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Dashboard' data-active={location.pathname === '/dashboard'}>
								<Link to='/dashboard'>
									<div className='w-[21px] h-[21px]'>
										<CircleGauge size={21} />
									</div>
									<span className='pl-2 font-inter'>Dashboard</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Agendamentos' data-active={location.pathname === '/bookings'}>
								<Link to='/bookings'>
									<div className='w-[21px] h-[21px]'>
										<Calendar size={21} />
									</div>
									<span className='pl-2 font-inter'>Agendamentos</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Veículos' data-active={location.pathname === '/vehicles'}>
								<Link to='/vehicles'>
									<div className='w-[21px] h-[21px]'>
										<CarFront size={22} />
									</div>
									<span className='pl-2 font-inter'>Veículos</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Clientes' data-active={location.pathname === '/clients'}>
								<Link to='/clients'>
									<div className='w-[21px] h-[21px]'>
										<Users size={21} />
									</div>
									<span className='pl-2 font-inter'>Clientes</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Serviços' data-active={location.pathname === '/services'}>
								<Link to='/services'>
									<div className='w-[21px] h-[21px]'>
										<Layers2 size={21} />
									</div>
									<span className='pl-2 font-inter'>Serviços</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Configurações' data-active={location.pathname === '/settings'}>
								<Link to='/settings'>
									<div className='w-[21px] h-[21px]'>
										<Settings2 size={21} />
									</div>
									<span className='pl-2 font-inter'>Configurações</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* <Collapsible asChild className='group/collapsible'>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip='Clientes'>
										<div className='w-[21px] h-[21px]'>
											<Users size={21} />
										</div>
										<span className='pl-2'>Clientes</span>
										<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' size={21} color='#999999' />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild data-active={location.pathname === '/tenants'}>
												<Link to='/tenants'>
													<span className='pl-3'>Todos</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<Link to='/owners'>
													<span className='pl-3'>Proprietários</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<Link to='/tenants'>
													<span className='pl-3'>Locatários</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<Link to='/buyers'>
													<span className='pl-3'>Compradores</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>	 */}
					</SidebarMenu>
				</SidebarGroup>

				<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
					<SidebarGroupLabel>Financeiro</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href='#'>
									<Frame />
									<span>Design Engineering</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href='#'>
									<PieChart />
									<span>Sales & Marketing</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href='#'>
									<Map />
									<span>Travel</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
      		
			<SidebarFooter>
        		<NavUser user={{
					name: 'Érico',
					info: '(11) 98825-9997)',
					avatar: '/avatars/shadcn.jpg',
				}} />
      		</SidebarFooter>
      		<SidebarRail />
    	</Sidebar>
  	)
}
