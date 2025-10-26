import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignIn } from '@/pages/signin'
import { Dashboard } from '@/pages/dashboard'
import { Bookings } from '@/pages/bookings'
import { Services } from '@/pages/services'
import { ServicesAdd } from '@/pages/services/add'
import { Settings } from '@/pages/settings'
import { Clients } from '@/pages/clients'
import { AuthProvider } from '@/contexts'
import { ThemeProvider } from '@/contexts/theme-context'


export function AppRoutes() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<SignIn />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/add" element={<ServicesAdd />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/clients" element={<Clients />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}