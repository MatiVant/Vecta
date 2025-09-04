"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, User, Phone, MapPin, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import type { Client } from "./order-form"

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void
  selectedClient: Client | null
}

const mockClients: Client[] = [
  {
    id: 1,
    code: "CLI001",
    name: "Empresa ABC S.A.",
    fiscalNumber: "12345678-9",
    address: "Av. Providencia 1234, Santiago",
    phone: "+56912345678",
  },
  {
    id: 2,
    code: "CLI002",
    name: "Comercial XYZ Ltda.",
    fiscalNumber: "87654321-K",
    address: "Las Condes 5678, Santiago",
    phone: "+56987654321",
  },
  {
    id: 3,
    code: "CLI003",
    name: "Distribuidora DEF",
    fiscalNumber: "11223344-5",
    address: "Maipú 9012, Santiago",
    phone: "+56911223344",
  },
]

export function ClientSelector({ onClientSelect, selectedClient }: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      setConnectionError(false)
      setUsingMockData(false)

      try {
        const url = "http://localhost:3001/bpartners"
        console.log("[v0] Attempting to fetch from:", url)

        const response = await fetch(url)
        console.log("[v0] Response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Received data:", data)
          setClients(data)
        } else {
          console.log("[v0] Response not ok, using mock data")
          setClients(mockClients)
          setUsingMockData(true)
        }
      } catch (error) {
        console.error("[v0] Fetch failed, using mock data:", error.message)
        setClients(mockClients)
        setUsingMockData(true)
        setConnectionError(false) // No mostrar error, solo usar mock
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return []

    return clients
      .filter(
        (client) =>
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.fiscalNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5) // Limit to 5 suggestions
  }, [clients, searchTerm])

  const handleClientSelect = (client: Client) => {
    setSearchTerm(client.name || client.code || "")
    setShowSuggestions(false)
    onClientSelect(client)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setShowSuggestions(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Seleccionar Cliente
          {usingMockData && (
            <Badge variant="outline" className="text-xs">
              Datos de prueba
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {usingMockData && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Modo de desarrollo:</strong> Usando datos de prueba. Para conectar tu backend, usa ngrok para
              exponer localhost:3001
            </p>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Label htmlFor="client-search" className="text-sm font-medium">
            Buscar Cliente
          </Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="client-search"
              type="text"
              placeholder="Buscar por nombre, código o número fiscal..."
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Cargando clientes...</div>
              ) : connectionError ? (
                <div className="p-4 text-center text-destructive">
                  <p className="font-medium">Error de conexión</p>
                  <p className="text-sm text-muted-foreground">
                    No se puede conectar al servidor. Usa ngrok para exponer localhost:3001
                  </p>
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.code && <span>Código: {client.code}</span>}
                      {client.fiscalNumber && <span className="ml-2">RUT: {client.fiscalNumber}</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No se encontraron clientes</div>
              )}
            </div>
          )}
        </div>

        {/* Selected Client Details */}
        {selectedClient && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Cliente Seleccionado</Badge>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">NOMBRE</Label>
                      <p className="font-medium">{selectedClient.name}</p>
                    </div>

                    {selectedClient.code && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">CÓDIGO</Label>
                        <p className="font-medium">{selectedClient.code}</p>
                      </div>
                    )}

                    {selectedClient.fiscalNumber && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">NÚMERO FISCAL</Label>
                          <p className="font-medium">{selectedClient.fiscalNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedClient.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">DIRECCIÓN</Label>
                          <p className="font-medium">{selectedClient.address}</p>
                        </div>
                      </div>
                    )}

                    {selectedClient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">TELÉFONO</Label>
                          <p className="font-medium">{selectedClient.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
