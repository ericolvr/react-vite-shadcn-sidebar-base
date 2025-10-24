import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/dashboard'
import { Bookings } from '@/pages/bookings'
import { Services } from '@/pages/services'
import { ServicesAdd } from '@/pages/services/add'
import { Settings } from '@/pages/settings'
import { ThemeProvider } from '@/contexts/theme-context'


export function AppRoutes() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/add" element={<ServicesAdd />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}