import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/dashboard'
import { Tenants } from '@/pages/tenants'
import { ThemeProvider } from '@/contexts/theme-context'


export function AppRoutes() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tenants" element={<Tenants />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}