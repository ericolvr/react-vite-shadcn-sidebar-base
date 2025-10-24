
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'


export function Services() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header 
					breadcrumbs={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Serviços' }
					]}
				/>
				<div className='flex flex-1 flex-col gap-4 p-4 mx-3 pt-0 mb-3'>
					
					<div className='bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min' />
				</div>
			</SidebarInset>
		</SidebarProvider>
  	)
}
