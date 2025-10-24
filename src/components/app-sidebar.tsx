'use client'

import * as React from 'react'
import {
	AudioWaveform,
	BookOpen,
	Building,
	CircleGauge,
	Frame,
	GalleryVerticalEnd,
	Map,
	PieChart,
	Settings2,
	SquarePen,
	SquareTerminal,
	Users,
} from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
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
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation()
	
	return (
    	<Sidebar collapsible='icon' {...props}>
      		<SidebarHeader>
        		<div className='mx-2 mt-2 group-data-[collapsible=icon]:ml-4'>
					<TeamSwitcher teams={[
						{
							name: 'Imobiliária 1',
							logo: GalleryVerticalEnd,
							plan: 'Enterprise',
						},
						{
							name: 'Imobiliária 2',
							logo: AudioWaveform,
							plan: 'Startup',
						},
					]} />
				</div>
      		</SidebarHeader>
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
									<span className='pl-2'>Dashboard</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Contratos'>
								<Link to='/'>
									<div className='w-[21px] h-[21px]'>
										<SquarePen size={21} />
									</div>
									<span className='pl-2'>Contratos</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip='Imobiliárias' data-active={location.pathname === '/imobiliarias'}>
								<Link to='/imobiliarias'>
								<div className='w-[21px] h-[21px]'>
									<Building size={21} />
								</div>
									<span className='pl-2'>Imobiliárias</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<Collapsible asChild className='group/collapsible'>
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
						</Collapsible>	
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
