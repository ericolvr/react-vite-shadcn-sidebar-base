import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { vehicleService, type Vehicle } from './vehicle-service'

interface CustomerSelectorProps {
    onVehicleSelect?: (vehicle: Vehicle) => void
    selectedVehicle?: Vehicle
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    onVehicleSelect,
    selectedVehicle
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)

    // Buscar veículos quando o query mudar
    useEffect(() => {
        const searchVehicles = async () => {
            console.log('🔤 Query atual:', searchQuery, 'Tamanho:', searchQuery.length)
            
            if (searchQuery.length < 2) {
                console.log('⏹️ Query muito pequeno, limpando resultados')
                setVehicles([])
                return
            }

            try {
                console.log('⏳ Iniciando busca com query:', searchQuery)
                setLoading(true)
                const results = await vehicleService.searchForBook(1, searchQuery)
                console.log('✅ Resultados recebidos no componente:', results)
                setVehicles(results)
            } catch (error) {
                console.error('💥 Erro no componente ao buscar veículos:', error)
                setVehicles([])
            } finally {
                setLoading(false)
                console.log('🏁 Busca finalizada')
            }
        }

        console.log('⏰ Configurando debounce para query:', searchQuery)
        const debounceTimer = setTimeout(searchVehicles, 300)
        return () => {
            console.log('🧹 Limpando timer anterior')
            clearTimeout(debounceTimer)
        }
    }, [searchQuery])

    const handleVehicleSelect = (vehicle: Vehicle) => {
        onVehicleSelect?.(vehicle)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Veículo</label>
            
            {selectedVehicle ? (
                // Veículo selecionado
                <div 
                    className="border rounded-lg p-4 bg-[#317CE5] text-white cursor-pointer hover:bg-[#2563eb] transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="font-medium">
                        {selectedVehicle.plate} - {selectedVehicle.client_name} - {selectedVehicle.client_phone}
                    </div>
                </div>
            ) : (
                // Campo de busca
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por placa, modelo, proprietário..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317CE5] focus:border-transparent"
                        />
                    </div>

                    {/* Dropdown de resultados */}
                    {isOpen && (searchQuery.length >= 2 || vehicles.length > 0) && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    Buscando veículos...
                                </div>
                            ) : vehicles.length > 0 ? (
                                vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => handleVehicleSelect(vehicle)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    >
                                        <div className="font-medium text-sm">
                                            {vehicle.plate} - {vehicle.client_name} - {vehicle.client_phone}
                                        </div>
                                    </div>
                                ))
                            ) : searchQuery.length >= 2 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Nenhum veículo encontrado
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    Digite pelo menos 2 caracteres para buscar
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Overlay para fechar dropdown */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}

export default CustomerSelector
