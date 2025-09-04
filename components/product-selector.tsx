"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Package, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import type { Client, Product, OrderItem } from "./order-form"

interface ProductSelectorProps {
  client: Client
  onProductsComplete: (items: OrderItem[]) => void
  onBack: () => void
  initialItems: OrderItem[]
}

export function ProductSelector({ client, onProductsComplete, onBack, initialItems }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Assuming products endpoint exists at localhost:3000/products
        const response = await fetch("http://localhost:3000/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        // Mock data for development
        setProducts([
          { id: 1, code: "PROD001", name: "Producto Ejemplo 1" },
          { id: 2, code: "PROD002", name: "Producto Ejemplo 2" },
          { id: 3, code: "PROD003", name: "Producto Ejemplo 3" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return []

    return products
      .filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5)
  }, [products, searchTerm])

  const handleProductSelect = (product: Product) => {
    const existingItem = orderItems.find((item) => item.product.id === product.id)

    if (existingItem) {
      setOrderItems((items) =>
        items.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems((items) => [...items, { product, quantity: 1 }])
    }

    setSearchTerm("")
    setShowSuggestions(false)
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
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="product-search"
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Cargando productos...</div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">Código: {product.code}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No se encontraron productos</div>
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
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">Código: {item.product.code}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
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
                        className="w-20 text-center"
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Cliente
        </Button>

        <Button onClick={handleContinue} disabled={orderItems.length === 0}>
          Continuar al Resumen
        </Button>
      </div>
    </div>
  )
}
