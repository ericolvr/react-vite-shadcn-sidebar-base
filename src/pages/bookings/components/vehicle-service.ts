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
            const response = await fetch(url)    
            if (!response.ok) {
                console.error('Response não OK:', response.status, response.statusText)
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data: VehicleSearchResponse = await response.json()                
            return data.vehicles || []
        } catch (error) {
            console.error('💥 Erro ao buscar veículos:', error)
            throw error
        }
    }
}

export const vehicleService = new VehicleService()
