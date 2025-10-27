const API_BASE_URL = 'http://localhost:8080/api/v1'

export interface Vehicle {
    id: number
    plate: string
    model: string
    brand: string
    color: string
    year: number
    owner_name?: string
    owner_phone?: string
}

export interface VehicleSearchResponse {
    vehicles: Vehicle[]
    total: number
}

class VehicleService {
    async searchForBook(companyId: number, query: string): Promise<Vehicle[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/vehicles/search-for-book?company_id=${companyId}&query=${encodeURIComponent(query)}`
            )
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data: VehicleSearchResponse = await response.json()
            return data.vehicles || []
        } catch (error) {
            console.error('Erro ao buscar veículos:', error)
            throw error
        }
    }
}

export const vehicleService = new VehicleService()
