const API_BASE_URL = 'http://localhost:8080/api/v1'

export interface Vehicle {
    id: number              // vehicle_id para o booking
    company_id: number      // company_id para o booking
    client_id: number       // client_id para o booking ✅
    client_name: string     // nome do cliente
    client_phone: string    // telefone do cliente
    plate: string           // placa do veículo
}

export interface VehicleSearchResponse {
    vehicles: Vehicle[]
    total: number
}

class VehicleService {
    async searchForBook(companyId: number, query: string): Promise<Vehicle[]> {
        try {
            const url = `${API_BASE_URL}/vehicles/search-for-book?company_id=${companyId}&query=${encodeURIComponent(query)}`
            console.log('🔍 Fazendo busca de veículos:', { url, companyId, query })
            
            const response = await fetch(url)
            
            console.log('📡 Response status:', response.status)
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
            
            if (!response.ok) {
                console.error('❌ Response não OK:', response.status, response.statusText)
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data: VehicleSearchResponse = await response.json()
            console.log('✅ Response data completo:', data)
            console.log('🚗 Veículos encontrados:', data.vehicles?.length || 0)
            console.log('🚗 Lista de veículos:', data.vehicles)
            
            // Log detalhado de cada veículo para verificar campos disponíveis
            data.vehicles?.forEach((vehicle, index) => {
                console.log(`🚗 Veículo ${index + 1}:`, {
                    id: vehicle.id,                    // vehicle_id ✅
                    company_id: vehicle.company_id,    // company_id ✅
                    client_id: vehicle.client_id,      // client_id ✅
                    client_name: vehicle.client_name,  // nome do cliente ✅
                    client_phone: vehicle.client_phone, // telefone ✅
                    plate: vehicle.plate,              // placa ✅
                    // Mostrar todos os campos para debug
                    all_fields: vehicle
                })
            })
            
            return data.vehicles || []
        } catch (error) {
            console.error('💥 Erro ao buscar veículos:', error)
            throw error
        }
    }
}

export const vehicleService = new VehicleService()
