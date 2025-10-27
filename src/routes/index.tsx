import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignIn } from '@/pages/signin'
import { Dashboard } from '@/pages/dashboard'
import { Bookings } from '@/pages/bookings'
import { BookingsList } from '@/pages/bookings/list'
import { Services } from '@/pages/services'
import { ServicesAdd } from '@/pages/services/add'
import { Settings } from '@/pages/settings'
import { Clients } from '@/pages/clients'
import { Vehicles } from '@/pages/vehicles'
// import { VehiclesAdd } from '@/pages/vehicles/add'
import { VehiclesEdit } from '@/pages/vehicles/edit'
import { ClientsEdit } from '@/pages/clients/edit'
import { ServicesEdit } from '@/pages/services/edit'
import { Loyalty } from '@/pages/loyalty'
import { LoyaltyDashboard } from '@/pages/loyalty/dashboard'
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
                        <Route path="/bookings/list" element={<BookingsList />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/add" element={<ServicesAdd />} />
                        <Route path="/services/edit/:id" element={<ServicesEdit />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/edit/:id" element={<ClientsEdit />} />
                        <Route path="/vehicles" element={<Vehicles />} />
                        <Route path="/vehicles/edit/:id" element={<VehiclesEdit />} />
                        <Route path="/loyalty" element={<Loyalty />} />
                        <Route path="/loyalty/dashboard" element={<LoyaltyDashboard />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}