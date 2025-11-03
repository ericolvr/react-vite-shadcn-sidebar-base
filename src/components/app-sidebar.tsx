'use client'

import * as React from 'react'
import {
	Bubbles,
	Calendar,
	CarFront,
	CircleGauge,
	Gift,
	Layers2,
	PieChart,
	Settings2,
	Users,
	ChevronRight,
	List,
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
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Link, useLocation } from 'react-router-dom'


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation()
	
	return (
    	<Sidebar collapsible='icon' className='bg-[#FAFAFA] [&>div]:bg-[#FAFAFA] [&_[data-sidebar="sidebar"]]:bg-[#FAFAFA]' {...props}>
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

						<Collapsible asChild className='group/collapsible'>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip='Fidelidade' data-active={location.pathname.startsWith('/loyalty')}>
										<div className='w-[21px] h-[21px]'>
											<Gift size={21} />
										</div>
										<span className='pl-2 font-inter'>Fidelidade</span>
										<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' size={16} color='#999999' />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild data-active={location.pathname === '/loyalty'}>
												<Link to='/loyalty'>
													<List size={16} />
													<span className='font-inter'>Lista de Contas</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild data-active={location.pathname === '/loyalty/dashboard'}>
												<Link to='/loyalty/dashboard'>
													<PieChart size={16} />
													<span className='font-inter'>Dashboard</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>

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
					</SidebarMenu>
				</SidebarGroup>

				{/* <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
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
				</SidebarGroup> */}
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
