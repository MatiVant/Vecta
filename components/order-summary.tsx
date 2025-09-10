"use client"

import { useState } from "react"
import { ArrowLeft, FileText, Download, User, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import type { Client, OrderItem } from "./order-form"

interface OrderSummaryProps {
  client: Client
  orderItems: OrderItem[]
  onBack: () => void
}

interface OrderResponse {
  id: string
  pdfUrl?: string
  message: string
}

export function OrderSummary({ client, orderItems, onBack }: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null)

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      const orderData = {
        client: client,
        items: orderItems,
        createdAt: new Date().toISOString(),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const responseData = await response.json()
        setOrderResponse(responseData)
        setOrderSubmitted(true)
      } else {
        const errorData = await response.json()
        console.error("Error submitting order:", errorData)
        alert(errorData.message || "Error al enviar el pedido")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Error de conexión. Verifica tu conexión a internet.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      if (orderResponse?.pdfUrl) {
        // If backend provides PDF URL, download it directly
        const link = document.createElement("a")
        link.href = orderResponse.pdfUrl
        link.download = `pedido-${orderResponse.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Fallback: generate PDF client-side using browser print
        generateClientSidePDF()
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      // Fallback to client-side generation
      generateClientSidePDF()
    }
  }

  const generateClientSidePDF = () => {
    // Create a new window with the order content for printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const orderDate = new Date().toLocaleDateString("es-ES")
      const orderTime = new Date().toLocaleTimeString("es-ES")

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido - ${client.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #374151; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #15803d; padding-bottom: 20px; }
            .client-info, .order-items { margin-bottom: 30px; }
            .client-info h3, .order-items h3 { color: #15803d; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #6b7280; font-size: 12px; }
            .info-value { margin-top: 2px; }
            .item { border: 1px solid #d1d5db; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .item-header { display: flex; justify-content: space-between; align-items: center; }
            .item-name { font-weight: bold; }
            .item-code { color: #6b7280; font-size: 14px; }
            .quantity { font-weight: bold; color: #15803d; }
            .summary { background-color: #f0fdf4; padding: 20px; border-radius: 5px; text-align: center; }
            .total { font-size: 18px; font-weight: bold; color: #15803d; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PEDIDO</h1>
            <p>Fecha: ${orderDate} - Hora: ${orderTime}</p>
            ${orderResponse?.id ? `<p>ID: ${orderResponse.id}</p>` : ""}
          </div>
          
          <div class="client-info">
            <h3>Información del Cliente</h3>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">NOMBRE</div>
                  <div class="info-value">${client.name || "N/A"}</div>
                </div>
                ${
                  client.code
                    ? `
                <div class="info-item">
                  <div class="info-label">CÓDIGO</div>
                  <div class="info-value">${client.code}</div>
                </div>
                `
                    : ""
                }
                ${
                  client.fiscalNumber
                    ? `
                <div class="info-item">
                  <div class="info-label">NÚMERO FISCAL</div>
                  <div class="info-value">${client.fiscalNumber}</div>
                </div>
                `
                    : ""
                }
              </div>
              <div>
                ${
                  client.address
                    ? `
                <div class="info-item">
                  <div class="info-label">DIRECCIÓN</div>
                  <div class="info-value">${client.address}</div>
                </div>
                `
                    : ""
                }
                ${
                  client.phone
                    ? `
                <div class="info-item">
                  <div class="info-label">TELÉFONO</div>
                  <div class="info-value">${client.phone}</div>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
          
          <div class="order-items">
            <h3>Productos del Pedido</h3>
            ${orderItems
              .map(
                (item) => `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="item-name">${item.product.name}</div>
                    <div class="item-code">Código: ${item.product.code}</div>
                  </div>
                  <div class="quantity">Cantidad: ${item.quantity}</div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="summary">
            <div class="total">Total de Productos: ${totalItems}</div>
            <p style="margin-top: 10px; color: #6b7280;">* Los precios se calcularán según la lista de precios vigente</p>
          </div>
          
          <div class="footer">
            <p>Pedido generado el ${orderDate} a las ${orderTime}</p>
            <p>Sistema de Gestión de Pedidos</p>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  if (orderSubmitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">¡Pedido Creado Exitosamente!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-muted-foreground">
            {orderResponse?.message || "El pedido ha sido guardado y está listo para procesar."}
          </div>
          {orderResponse?.id && (
            <div className="text-sm text-muted-foreground">
              ID del Pedido: <span className="font-mono font-medium">{orderResponse.id}</span>
            </div>
          )}

          <Button className="w-full" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF del Pedido
          </Button>

          <Button variant="outline" onClick={() => window.location.reload()}>
            Crear Nuevo Pedido
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resumen del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Información del Cliente</h3>
            </div>

            <Card className="bg-blue-50/50 border-blue-100">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    {client.code && <p className="text-sm text-muted-foreground">Código: {client.code}</p>}
                    {client.fiscalNumber && <p className="text-sm text-muted-foreground">RUT: {client.fiscalNumber}</p>}
                  </div>
                  <div>
                    {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
                    {client.phone && <p className="text-sm text-muted-foreground">Tel: {client.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <h3 className="font-medium">Productos del Pedido</h3>
              </div>
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </Badge>
            </div>

            <div className="space-y-3">
              {orderItems.map((item) => (
                <Card key={item.product.id} className="bg-gray-50/50 border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">Código: {item.product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="bg-green-50/50 border border-green-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total de Productos:</span>
              <span className="font-bold text-lg text-green-700">{totalItems}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              * Los precios se calcularán según la lista de precios vigente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Productos
        </Button>

        <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? "Guardando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  )
}
