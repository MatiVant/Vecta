"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Package, Plus, Minus, Trash2, ArrowLeft, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { fetchWithFallback } from "../lib/api-utils"
import type { Client, Product, OrderItem } from "./order-form"

interface ProductSelectorProps {
  client: Client
  onProductsComplete: (items: OrderItem[]) => void
  onBack: () => void
  initialItems: OrderItem[]
}

const mockProducts: Product[] = [
  { id: 1, code: "PROD001", name: "Producto Ejemplo 1" },
  { id: 2, code: "PROD002", name: "Producto Ejemplo 2" },
  { id: 3, code: "PROD003", name: "Producto Ejemplo 3" },
]

export function ProductSelector({ client, onProductsComplete, onBack, initialItems }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      const result = await fetchWithFallback({
        endpoint: "/products", // Using endpoint instead of API route, now consistent with client-selector
        mockData: mockProducts,
        errorMessage: "Error al cargar productos",
      })

      setProducts(result.data)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (showAllProducts) {
      return products.slice(0, 10)
    }

    if (!searchTerm.trim()) return []

    return products
      .filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5)
  }, [products, searchTerm, showAllProducts])

  const handleProductSelect = (product: Product) => {
    const existingItem = orderItems.find((item) => item.product.id === product.id)

    if (existingItem) {
      setOrderItems((items) =>
        items.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems((items) => [...items, { product, quantity: 1, unit: "unidades", observations: "" }])
    }

    setSearchTerm("")
    setShowSuggestions(false)
    setShowAllProducts(false)
  }

  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts)
    setShowSuggestions(false)
    setSearchTerm("")
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setOrderItems((items) =>
      items.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const removeItem = (productId: number) => {
    setOrderItems((items) => items.filter((item) => item.product.id !== productId))
  }

  const updateUnit = (productId: number, unit: "unidades" | "pallets") => {
    setOrderItems((items) => items.map((item) => (item.product.id === productId ? { ...item, unit } : item)))
  }

  const updateObservations = (productId: number, observations: string) => {
    setOrderItems((items) => items.map((item) => (item.product.id === productId ? { ...item, observations } : item)))
  }

  const handleContinue = () => {
    if (orderItems.length > 0) {
      onProductsComplete(orderItems)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Seleccionar Productos
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Cliente: <span className="font-medium">{client.name}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Label htmlFor="product-search" className="text-sm font-medium">
              Buscar Producto
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="product-search"
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSuggestions(true)
                    setShowAllProducts(false)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={toggleShowAllProducts}
                className="px-3 bg-transparent"
                title="Ver todos los productos"
              >
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllProducts ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {((showSuggestions && searchTerm) || showAllProducts) && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Cargando productos...</div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    {showAllProducts && (
                      <div className="p-2 bg-muted/50 border-b border-border">
                        <p className="text-xs text-muted-foreground font-medium">
                          Todos los productos ({products.length} total)
                        </p>
                      </div>
                    )}
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Código: {product.code}</div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {showAllProducts ? "No hay productos disponibles" : "No se encontraron productos"}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Products */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Productos Seleccionados</span>
              <Badge variant="secondary">{orderItems.length} productos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.product.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">Código: {item.product.code}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, Number.parseInt(e.target.value) || 0)}
                          className="w-16 sm:w-20 text-center text-sm"
                          min="1"
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unit Selector and Observations Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                    <div>
                      <Label htmlFor={`unit-${item.product.id}`} className="text-sm font-medium">
                        Unidad
                      </Label>
                      <select
                        id={`unit-${item.product.id}`}
                        value={item.unit}
                        onChange={(e) => updateUnit(item.product.id, e.target.value as "unidades" | "pallets")}
                        className="mt-1 w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="unidades">Unidades</option>
                        <option value="pallets">Pallets</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`obs-${item.product.id}`} className="text-sm font-medium">
                        Observaciones
                      </Label>
                      <Input
                        id={`obs-${item.product.id}`}
                        type="text"
                        placeholder="Observaciones del producto..."
                        value={item.observations || ""}
                        onChange={(e) => updateObservations(item.product.id, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">

        <Button onClick={handleContinue} disabled={orderItems.length === 0} className="w-full sm:w-auto">
          Continuar al Resumen
        </Button>
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Cliente
        </Button>
      </div>
    </div>
  )
}
