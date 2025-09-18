"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, User, Phone, MapPin, Check, Edit, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { fetchWithFallback } from "../lib/api-utils"
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
  const [showAllClients, setShowAllClients] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)
  const [pendingClient, setPendingClient] = useState<Client | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)

      const result = await fetchWithFallback({
        endpoint: "/bpartners", // Using endpoint instead of full URL
        mockData: mockClients,
        errorMessage: "No se puede conectar al servidor",
      })

      setClients(result.data)
      setUsingMockData(result.usingMockData)
      setConnectionError(result.connectionError)
      setLoading(false)
    }

    fetchClients()
  }, [])

  const filteredClients = useMemo(() => {
    if (showAllClients) {
      return clients.slice(0, 10) // Mostrar máximo 10 clientes
    }

    if (!searchTerm.trim()) return []

    return clients
      .filter(
        (client) =>
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.fiscalNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5) // Limit to 5 suggestions
  }, [clients, searchTerm, showAllClients])

  const handleClientSelect = (client: Client) => {
    setSearchTerm(client.name || client.code || "")
    setShowSuggestions(false)
    setShowAllClients(false)
    setPendingClient(client)
    setIsConfirmed(false)
  }

  const toggleShowAllClients = () => {
    setShowAllClients(!showAllClients)
    setShowSuggestions(false)
    setSearchTerm("")
  }

  const handleConfirmClient = () => {
    if (pendingClient) {
      onClientSelect(pendingClient)
      setIsConfirmed(true)
    }
  }

  const handleChangeClient = () => {
    setPendingClient(null)
    setIsConfirmed(false)
    setSearchTerm("")
    onClientSelect(null)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setShowSuggestions(true)
    setShowAllClients(false)
    if (pendingClient && !isConfirmed) {
      setPendingClient(null)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="truncate">Seleccionar Cliente</span>
          {isConfirmed && selectedClient && (
            <Badge variant="default" className="text-xs bg-green-600 shrink-0">
              <Check className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Confirmado</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usingMockData && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <Badge variant="outline" className="text-xs shrink-0 self-start">
                Datos de prueba
              </Badge>
              <p className="text-sm text-blue-800 min-w-0">
                <strong className="block sm:inline">Modo de desarrollo:</strong>
                <span className="block sm:inline sm:ml-1">Usando datos de prueba.</span>
              </p>
            </div>
          </div>
        )}

        {!isConfirmed && (
          <div className="relative">
            <Label htmlFor="client-search" className="text-sm font-medium">
              Buscar Cliente
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="client-search"
                  type="text"
                  placeholder="Buscar por nombre, código..."
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 text-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={toggleShowAllClients}
                className="px-3 shrink-0 bg-transparent"
                title="Ver todos los clientes"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllClients ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {((showSuggestions && searchTerm) || showAllClients) && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">Cargando clientes...</div>
                ) : connectionError ? (
                  <div className="p-4 text-center text-destructive">
                    <p className="font-medium text-sm">Error de conexión</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No se puede conectar al servidor. Usa ngrok para exponer localhost:3000
                    </p>
                  </div>
                ) : filteredClients.length > 0 ? (
                  <>
                    {showAllClients && (
                      <div className="p-2 bg-muted/50 border-b border-border">
                        <p className="text-xs text-muted-foreground font-medium">
                          Todos los clientes ({clients.length} total)
                        </p>
                      </div>
                    )}
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-sm truncate">{client.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          {client.code && <div className="truncate">Código: {client.code}</div>}
                          {client.fiscalNumber && <div className="truncate">RUT: {client.fiscalNumber}</div>}
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {showAllClients ? "No hay clientes disponibles" : "No se encontraron clientes"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(pendingClient || selectedClient) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                {isConfirmed ? (
                  <Badge variant="default" className="bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Cliente Confirmado
                  </Badge>
                ) : (
                  <Badge variant="secondary">Cliente Seleccionado</Badge>
                )}
              </div>
              {isConfirmed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangeClient}
                  className="self-start sm:self-auto bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Cambiar Cliente
                </Button>
              )}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">NOMBRE</Label>
                      <p className="font-medium text-sm mt-1 break-words">{(pendingClient || selectedClient)?.name}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(pendingClient || selectedClient)?.code && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">CÓDIGO</Label>
                          <p className="font-medium text-sm mt-1">{(pendingClient || selectedClient)?.code}</p>
                        </div>
                      )}
                      {(pendingClient || selectedClient)?.fiscalNumber && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">NÚMERO FISCAL</Label>
                          <p className="font-medium text-sm mt-1">{(pendingClient || selectedClient)?.fiscalNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {((pendingClient || selectedClient)?.address || (pendingClient || selectedClient)?.phone) && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      {(pendingClient || selectedClient)?.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">DIRECCIÓN</Label>
                            <p className="font-medium text-sm mt-1 break-words">
                              {(pendingClient || selectedClient)?.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {(pendingClient || selectedClient)?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">TELÉFONO</Label>
                            <p className="font-medium text-sm mt-1">{(pendingClient || selectedClient)?.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {pendingClient && !isConfirmed && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleConfirmClient} className="w-full sm:flex-1 text-sm">
                  
                          Confirmar Cliente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPendingClient(null)}
                          className="w-full sm:w-auto text-sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
