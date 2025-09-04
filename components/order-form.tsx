"use client"

import { useState } from "react"
import { ClientSelector } from "./client-selector"
import { ProductSelector } from "./product-selector"
import { OrderSummary } from "./order-summary"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

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
}

type OrderStep = "client" | "products" | "summary"

export function OrderForm() {
  const [currentStep, setCurrentStep] = useState<OrderStep>("client")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const steps = [
    { id: "client", label: "Cliente", completed: !!selectedClient },
    { id: "products", label: "Productos", completed: orderItems.length > 0 },
    { id: "summary", label: "Resumen", completed: false },
  ]

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

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : step.completed
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                  {step.completed && (
                    <Badge variant="secondary" className="text-xs">
                      Completado
                    </Badge>
                  )}
                </div>
                {index < steps.length - 1 && <div className="w-12 h-px bg-border mx-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === "client" && (
        <ClientSelector onClientSelect={handleClientSelect} selectedClient={selectedClient} />
      )}

      {currentStep === "products" && selectedClient && (
        <ProductSelector
          client={selectedClient}
          onProductsComplete={handleProductsComplete}
          onBack={handleBackToClient}
          initialItems={orderItems}
        />
      )}

      {currentStep === "summary" && selectedClient && (
        <OrderSummary client={selectedClient} orderItems={orderItems} onBack={handleBackToProducts} />
      )}
    </div>
  )
}
