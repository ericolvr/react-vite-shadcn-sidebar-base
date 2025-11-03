import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/contexts/theme-context'

interface BreadcrumbItem {
	label: string
	href?: string
}

interface HeaderProps {
	breadcrumbs: BreadcrumbItem[]
	actions?: React.ReactNode // Para botões ou outros elementos no lado direito
}

export function Header({ breadcrumbs, actions }: HeaderProps) {
	const { isDark, toggleTheme } = useTheme()

	return (
		<header className='flex h-[65px] shrink-0 items-center gap-2  flex-row justify-between border-b border-[#E5E7EB] mx-8'>
			<div className='flex items-center'>
				<SidebarTrigger className='-ml-1' />
				<Separator orientation='vertical' className='mr-2 h-4' />
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((item, index) => (
							<div key={index} className='flex items-center'>
								{index > 0 && (
									<BreadcrumbSeparator className='hidden md:block' />
								)}
								<BreadcrumbItem className={index === 0 ? 'hidden md:block' : 'ml-2'}>
									{item.href ? (
										<BreadcrumbLink asChild>
											<Link 
												to={item.href}
												className='text-foreground hover:text-foreground/80 transition-colors no-underline'
											>
												{item.label}
											</Link>
										</BreadcrumbLink>
									) : (
										<BreadcrumbPage className='text-muted-foreground'>{item.label}</BreadcrumbPage>
									)}
								</BreadcrumbItem>
							</div>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<div className='flex items-center gap-2'>
				{actions}
				<Button
					variant='ghost'
					size='lg'
					onClick={toggleTheme}
					className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
				>
					{isDark ? (
						<Sun className='h-4 w-4' />
					) : (
						<Moon className='h-4 w-4' />
					)}
				</Button>
			</div>
		</header>
	)
}
