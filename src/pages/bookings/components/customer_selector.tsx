import React, { useState, useEffect } from 'react'
import { Search, Car, User, Phone } from 'lucide-react'
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
            if (searchQuery.length < 2) {
                setVehicles([])
                return
            }

            try {
                setLoading(true)
                const results = await vehicleService.searchForBook(1, searchQuery)
                setVehicles(results)
            } catch (error) {
                console.error('Erro ao buscar veículos:', error)
                setVehicles([])
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchVehicles, 300)
        return () => clearTimeout(debounceTimer)
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
                    <div className="flex items-center gap-3">
                        <Car className="h-5 w-5" />
                        <div className="flex-1">
                            <div className="font-medium">
                                {selectedVehicle.plate} - {selectedVehicle.brand} {selectedVehicle.model}
                            </div>
                            {selectedVehicle.owner_name && (
                                <div className="text-sm opacity-90 flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3" />
                                    {selectedVehicle.owner_name}
                                    {selectedVehicle.owner_phone && (
                                        <>
                                            <Phone className="h-3 w-3 ml-2" />
                                            {selectedVehicle.owner_phone}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
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
                                        <div className="flex items-center gap-3">
                                            <Car className="h-4 w-4 text-gray-400" />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {vehicle.color} • {vehicle.year}
                                                </div>
                                                {vehicle.owner_name && (
                                                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                        <User className="h-3 w-3" />
                                                        {vehicle.owner_name}
                                                        {vehicle.owner_phone && (
                                                            <>
                                                                <Phone className="h-3 w-3 ml-2" />
                                                                {vehicle.owner_phone}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
