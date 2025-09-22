"use client"

import { useState } from "react"
import { ClientSelector } from "./client-selector"
import { ProductSelector } from "./product-selector"
import { OrderSummary } from "./order-summary"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { User, Package, FileText } from "lucide-react"

export type Client = {
  id: number
  code?: string
  name?: string
  fiscalNumber?: string
  address?: string
  phone?: string
}

export type Product = {
  id: number
  code?: string
  name?: string
}

export type OrderItem = {
  product: Product
  quantity: number
  unit: "unidades" | "pallets"
  observations?: string
}

type OrderStep = "client" | "products" | "summary"

export function OrderForm() {
  const [currentStep, setCurrentStep] = useState<OrderStep>("client")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setCurrentStep("products")
  }

  const handleProductsComplete = (items: OrderItem[]) => {
    setOrderItems(items)
    setCurrentStep("summary")
  }

  const handleBackToClient = () => {
    setCurrentStep("client")
  }

  const handleBackToProducts = () => {
    setCurrentStep("products")
  }

  const handleNavigateToClient = () => {
    if (!isOrderCompleted) {
      setCurrentStep("client")
    }
  }

  const handleNavigateToProducts = () => {
    if (!isOrderCompleted && selectedClient) {
      setCurrentStep("products")
    }
  }

  const handleNavigateToSummary = () => {
    if (orderItems.length > 0) {
      setCurrentStep("summary")
    }
  }

  const handleOrderComplete = () => {
    setIsOrderCompleted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Nuevo Pedido</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <div
                  className={`flex items-center space-x-1 ${currentStep === "client" ? "text-primary font-medium" : ""}`}
                >
                  <User className="w-4 h-4" />
                  <span>Cliente</span>
                </div>
                {selectedClient && (
                  <>
                    <span>→</span>
                    <div
                      className={`flex items-center space-x-1 ${currentStep === "products" ? "text-primary font-medium" : ""}`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Productos</span>
                    </div>
                  </>
                )}
                {orderItems.length > 0 && (
                  <>
                    <span>→</span>
                    <div
                      className={`flex items-center space-x-1 ${currentStep === "summary" ? "text-primary font-medium" : ""}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Resumen</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="sm:hidden flex flex-col space-y-1 text-xs text-muted-foreground">
              <div
                className={`flex items-center space-x-1 ${currentStep === "client" ? "text-primary font-medium" : ""}`}
              >
                <User className="w-3 h-3" />
                <span>Cliente</span>
              </div>
              {selectedClient && (
                <div
                  className={`flex items-center space-x-1 ${currentStep === "products" ? "text-primary font-medium" : ""}`}
                >
                  <Package className="w-3 h-3" />
                  <span>Productos</span>
                </div>
              )}
              {orderItems.length > 0 && (
                <div
                  className={`flex items-center space-x-1 ${currentStep === "summary" ? "text-primary font-medium" : ""}`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Resumen</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Estado del Pedido</span>
                  {isOrderCompleted && <Badge variant="outline">Solo Lectura</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    selectedClient ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30"
                  } ${currentStep === "client" ? "ring-2 ring-primary/20" : ""} ${
                    isOrderCompleted ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleNavigateToClient}
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Cliente</span>
                    {selectedClient && <Badge variant="secondary">✓</Badge>}
                    {currentStep === "client" && (
                      <Badge variant="default" className="ml-auto">
                        Actual
                      </Badge>
                    )}
                  </div>
                  {selectedClient && <p className="text-sm text-muted-foreground mt-1">{selectedClient.name}</p>}
                </div>

                <div
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedClient && !isOrderCompleted
                      ? "cursor-pointer hover:shadow-md"
                      : "cursor-not-allowed opacity-50"
                  } ${
                    orderItems.length > 0 ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30"
                  } ${currentStep === "products" ? "ring-2 ring-primary/20" : ""}`}
                  onClick={handleNavigateToProducts}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">Productos</span>
                    {orderItems.length > 0 && <Badge variant="secondary">✓</Badge>}
                    {currentStep === "products" && (
                      <Badge variant="default" className="ml-auto">
                        Actual
                      </Badge>
                    )}
                  </div>
                  {orderItems.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">{orderItems.length} productos</p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg border-2 transition-all ${
                    orderItems.length > 0 ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-50"
                  } ${
                    currentStep === "summary"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-dashed border-muted-foreground/30"
                  }`}
                  onClick={handleNavigateToSummary}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Resumen</span>
                    {currentStep === "summary" && (
                      <Badge variant="default" className="ml-auto">
                        Actual
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {currentStep === "client" && (
              <ClientSelector
                onClientSelect={handleClientSelect}
                selectedClient={selectedClient}
                readOnly={isOrderCompleted}
              />
            )}

            {currentStep === "products" && selectedClient && (
              <ProductSelector
                client={selectedClient}
                onProductsComplete={handleProductsComplete}
                onBack={handleBackToClient}
                initialItems={orderItems}
                readOnly={isOrderCompleted}
              />
            )}

            {currentStep === "summary" && selectedClient && (
              <OrderSummary
                client={selectedClient}
                orderItems={orderItems}
                onBack={handleBackToProducts}
                onOrderComplete={handleOrderComplete}
                readOnly={isOrderCompleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
