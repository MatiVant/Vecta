"use client"

import { useState } from "react"
import { ArrowLeft, FileText, Download, User, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import type { Client, OrderItem } from "./order-form"
import html2canvas from "html2canvas"

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
  const [orderObservations, setOrderObservations] = useState("")

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      const orderData = {
        client: client,
        items: orderItems,
        observations: orderObservations,
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
        const link = document.createElement("a")
        link.href = orderResponse.pdfUrl
        link.download = `pedido-${orderResponse.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        generateClientSidePDF()
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      generateClientSidePDF()
    }
  }

  const handleShareWhatsApp = async () => {
    try {
      const imageBlob = await generateOrderImage()
      const imageFile = new File([imageBlob], `pedido-${client.name}.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: `Pedido - ${client.name}`,
          text: `Pedido para ${client.name}`,
          files: [imageFile],
        })
      } else {
        const imageUrl = URL.createObjectURL(imageBlob)
        const orderText =
          `*Pedido - ${client.name}*\n\n` +
          `*Cliente:* ${client.name}\n` +
          `${client.code ? `*Código:* ${client.code}\n` : ""}` +
          `${client.phone ? `*Teléfono:* ${client.phone}\n` : ""}` +
          `\n*Productos:*\n` +
          orderItems
            .map(
              (item) =>
                `• ${item.product.name} (${item.product.code}) - ${item.quantity} ${item.unit}` +
                `${item.observations ? `\n  _Obs: ${item.observations}_` : ""}`,
            )
            .join("\n") +
          `${orderObservations ? `\n\n*Observaciones del pedido:*\n${orderObservations}` : ""}` +
          `\n\n*Total productos:* ${totalItems}` +
          `${orderResponse?.id ? `\n*ID Pedido:* ${orderResponse.id}` : ""}`

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderText)}`
        window.open(whatsappUrl, "_blank")

        setTimeout(() => URL.revokeObjectURL(imageUrl), 5000)
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error)
      const orderText =
        `*Pedido - ${client.name}*\n\n` +
        `*Cliente:* ${client.name}\n` +
        `${client.code ? `*Código:* ${client.code}\n` : ""}` +
        `${client.phone ? `*Teléfono:* ${client.phone}\n` : ""}` +
        `\n*Productos:*\n` +
        orderItems
          .map(
            (item) =>
              `• ${item.product.name} (${item.product.code}) - ${item.quantity} ${item.unit}` +
              `${item.observations ? `\n  _Obs: ${item.observations}_` : ""}`,
          )
          .join("\n") +
        `${orderObservations ? `\n\n*Observaciones del pedido:*\n${orderObservations}` : ""}` +
        `\n\n*Total productos:* ${totalItems}` +
        `${orderResponse?.id ? `\n*ID Pedido:* ${orderResponse.id}` : ""}`

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderText)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  const handleShareEmail = async () => {
    try {
      const imageBlob = await generateOrderImage()
      const imageFile = new File([imageBlob], `pedido-${client.name}.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: `Pedido - ${client.name}`,
          text: `Pedido para ${client.name}`,
          files: [imageFile],
        })
      } else {
        const subject = `Pedido ${orderResponse?.id ? `#${orderResponse.id}` : ""} - ${client.name}`
        const body =
          `Pedido para ${client.name}\n\n` +
          `Cliente: ${client.name}\n` +
          `${client.code ? `Código: ${client.code}\n` : ""}` +
          `${client.phone ? `Teléfono: ${client.phone}\n` : ""}` +
          `${client.address ? `Dirección: ${client.address}\n` : ""}` +
          `\nProductos:\n` +
          orderItems
            .map(
              (item) =>
                `- ${item.product.name} (${item.product.code}) - ${item.quantity} ${item.unit}` +
                `${item.observations ? `\n  Observaciones: ${item.observations}` : ""}`,
            )
            .join("\n") +
          `${orderObservations ? `\n\nObservaciones del pedido:\n${orderObservations}` : ""}` +
          `\n\nTotal de productos: ${totalItems}` +
          `${orderResponse?.id ? `\nID del Pedido: ${orderResponse.id}` : ""}`

        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.location.href = mailtoUrl
      }
    } catch (error) {
      console.error("Error sharing via email:", error)
      const subject = `Pedido ${orderResponse?.id ? `#${orderResponse.id}` : ""} - ${client.name}`
      const body =
        `Pedido para ${client.name}\n\n` +
        `Cliente: ${client.name}\n` +
        `${client.code ? `Código: ${client.code}\n` : ""}` +
        `${client.phone ? `Teléfono: ${client.phone}\n` : ""}` +
        `${client.address ? `Dirección: ${client.address}\n` : ""}` +
        `\nProductos:\n` +
        orderItems
          .map(
            (item) =>
              `- ${item.product.name} (${item.product.code}) - ${item.quantity} ${item.unit}` +
              `${item.observations ? `\n  Observaciones: ${item.observations}` : ""}`,
          )
          .join("\n") +
        `${orderObservations ? `\n\nObservaciones del pedido:\n${orderObservations}` : ""}` +
        `\n\nTotal de productos: ${totalItems}` +
        `${orderResponse?.id ? `\nID del Pedido: ${orderResponse.id}` : ""}`

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = mailtoUrl
    }
  }

  const handleViewOrder = () => {
    generateClientSidePDF()
  }

  const generateClientSidePDF = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const logoBase64 = canvas.toDataURL("image/png")

      generatePDFWithLogo(logoBase64)
    }

    img.onerror = () => {
      generatePDFWithLogo("")
    }

    img.crossOrigin = "anonymous"
    img.src = "/images/indelma-logo.png"
  }

  const generatePDFWithLogo = (logoBase64: string) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const orderDate = new Date().toLocaleDateString("es-ES")
      const orderTime = new Date().toLocaleTimeString("es-ES")

      const logoHtml = logoBase64
        ? `<img src="${logoBase64}" alt="Molinos Indelma" class="logo" />`
        : `<div class="logo-placeholder" style="width: 80px; height: 60px; background: #000000; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">INDELMA</div>`

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido - ${client.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #374151; }
            .header { 
              position: relative;
              margin-bottom: 30px; 
              border-bottom: 2px solid #000000; 
              padding-bottom: 20px; 
              min-height: 80px;
            }
            .logo { 
              position: absolute;
              left: 0;
              top: 0;
              width: 140px; 
              height: auto; 
            }
            .logo-placeholder {
              position: absolute;
              left: 0;
              top: 0;
              width: 140px; 
              height: 60px; 
              background: #000000; 
              border-radius: 5px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 12px;
            }
            .header-text {
              text-align: center;
              width: 100%;
            }
            .client-info, .order-items, .order-observations { margin-bottom: 30px; }
            .client-info h3, .order-items h3, .order-observations h3 { 
              color: #000000; 
              border-bottom: 1px solid #d1d5db; 
              padding-bottom: 10px; 
            }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #6b7280; font-size: 12px; }
            .info-value { margin-top: 2px; }
            .item { border: 1px solid #d1d5db; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .item-name { font-weight: bold; }
            .item-code { color: #6b7280; font-size: 14px; }
            .quantity { font-weight: bold; color: #000000; }
            .item-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
            .summary { 
              background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); 
              padding: 20px; 
              border-radius: 5px; 
              text-align: center; 
              border: 1px solid #f59e0b;
            }
            .total { font-size: 18px; font-weight: bold; color: #000000; }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              border-top: 1px solid #000000;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoHtml}
            <div class="header-text">
              <h1 style="color: #000000; margin: 0;">PEDIDO</h1>
              <p style="margin: 5px 0;">Fecha: ${orderDate} - Hora: ${orderTime}</p>
              ${orderResponse?.id ? `<p style="margin: 5px 0;">ID: ${orderResponse.id}</p>` : ""}
            </div>
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
                  <div class="quantity">Cantidad: ${item.quantity} ${item.unit}</div>
                </div>
                ${
                  item.observations
                    ? `
                <div class="item-details">
                  <div>
                    <div class="info-label">OBSERVACIONES</div>
                    <div class="info-value">${item.observations}</div>
                  </div>
                </div>
                `
                    : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
          
          ${
            orderObservations
              ? `
          <div class="order-observations">
            <h3>Observaciones del Pedido</h3>
            <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 5px;">
              ${orderObservations}
            </div>
          </div>
          `
              : ""
          }
          
          <div class="summary">
            <div class="total">Total de Productos: ${totalItems}</div>
            <p style="margin-top: 10px; color: #6b7280;">* Los precios se calcularán según la lista de precios vigente</p>
          </div>
          
          <div class="footer">
            <p><strong>Molinos Indelma</strong></p>
            <p>Pedido generado el ${orderDate} a las ${orderTime}</p>
            <p>Sistema de Gestión de Pedidos</p>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const generateOrderImage = async (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const tempContainer = document.createElement("div")
        tempContainer.style.position = "absolute"
        tempContainer.style.left = "-9999px"
        tempContainer.style.top = "0"
        tempContainer.style.width = "800px"
        tempContainer.style.backgroundColor = "white"
        tempContainer.style.padding = "40px"
        tempContainer.style.fontFamily = "Arial, sans-serif"

        const orderDate = new Date().toLocaleDateString("es-ES")
        const orderTime = new Date().toLocaleTimeString("es-ES")

        tempContainer.innerHTML = `
          <div style="border-bottom: 3px solid #000000; padding-bottom: 20px; margin-bottom: 30px; position: relative; min-height: 80px;">
            <div style="position: absolute; left: 0; top: 0; width: 140px; height: 60px; background: #000000; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
              INDELMA
            </div>
            <div style="text-align: center; width: 100%;">
              <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: bold;">PEDIDO</h1>
              <p style="margin: 5px 0; color: #6b7280;">Fecha: ${orderDate} - Hora: ${orderTime}</p>
              ${orderResponse?.id ? `<p style="margin: 5px 0; color: #6b7280;">ID: ${orderResponse.id}</p>` : ""}
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #000000; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; margin-bottom: 15px;">Información del Cliente</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">NOMBRE</div>
                  <div style="margin-top: 2px; font-size: 16px;">${client.name || "N/A"}</div>
                </div>
                ${
                  client.code
                    ? `
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">CÓDIGO</div>
                  <div style="margin-top: 2px; font-size: 16px;">${client.code}</div>
                </div>
                `
                    : ""
                }
                ${
                  client.fiscalNumber
                    ? `
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">NÚMERO FISCAL</div>
                  <div style="margin-top: 2px; font-size: 16px;">${client.fiscalNumber}</div>
                </div>
                `
                    : ""
                }
              </div>
              <div>
                ${
                  client.address
                    ? `
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">DIRECCIÓN</div>
                  <div style="margin-top: 2px; font-size: 16px;">${client.address}</div>
                </div>
                `
                    : ""
                }
                ${
                  client.phone
                    ? `
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">TELÉFONO</div>
                  <div style="margin-top: 2px; font-size: 16px;">${client.phone}</div>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #000000; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; margin-bottom: 15px;">Productos del Pedido</h3>
            ${orderItems
              .map(
                (item) => `
              <div style="border: 1px solid #d1d5db; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div>
                    <div style="font-weight: bold; font-size: 16px;">${item.product.name}</div>
                    <div style="color: #6b7280; font-size: 14px;">Código: ${item.product.code}</div>
                  </div>
                  <div style="font-weight: bold; color: #000000; font-size: 16px;">Cantidad: ${item.quantity} ${item.unit}</div>
                </div>
                ${
                  item.observations
                    ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: bold; color: #6b7280; font-size: 12px;">OBSERVACIONES</div>
                  <div style="margin-top: 2px; font-size: 14px;">${item.observations}</div>
                </div>
                `
                    : ""
                }
              </div>
            `,
              )
              .join("")}
          </div>
          
          ${
            orderObservations
              ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #000000; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; margin-bottom: 15px;">Observaciones del Pedido</h3>
            <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 5px; font-size: 14px;">
              ${orderObservations}
            </div>
          </div>
          `
              : ""
          }
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); padding: 20px; border-radius: 5px; text-align: center; border: 1px solid #f59e0b; margin-bottom: 30px;">
            <div style="font-size: 18px; font-weight: bold; color: #000000;">Total de Productos: ${totalItems}</div>
            <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">* Los precios se calcularán según la lista de precios vigente</p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 2px solid #000000; padding-top: 20px;">
            <p style="margin: 0; font-weight: bold;">Molinos Indelma</p>
            <p style="margin: 5px 0;">Pedido generado el ${orderDate} a las ${orderTime}</p>
            <p style="margin: 0;">Sistema de Gestión de Pedidos</p>
          </div>
        `

        document.body.appendChild(tempContainer)

        const canvas = await html2canvas(tempContainer, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: tempContainer.scrollHeight,
        })

        document.body.removeChild(tempContainer)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("No se pudo generar la imagen"))
            }
          },
          "image/png",
          0.95,
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  const generatePDFBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const logoBase64 = canvas.toDataURL("image/png")

          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          document.body.appendChild(iframe)

          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const orderDate = new Date().toLocaleDateString("es-ES")
            const orderTime = new Date().toLocaleTimeString("es-ES")

            const logoHtml = logoBase64
              ? `<img src="${logoBase64}" alt="Molinos Indelma" class="logo" />`
              : `<div class="logo-placeholder">INDELMA</div>`

            iframeDoc.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Pedido - ${client.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; color: #374151; }
                  .header { 
                    position: relative;
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #000000; 
                    padding-bottom: 20px; 
                    min-height: 80px;
                  }
                  .logo { 
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 140px; 
                    height: auto; 
                  }
                  .logo-placeholder {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 140px; 
                    height: 60px; 
                    background: #000000; 
                    border-radius: 5px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 12px;
                  }
                  .header-text {
                    text-align: center;
                    width: 100%;
                  }
                  .client-info, .order-items, .order-observations { margin-bottom: 30px; }
                  .client-info h3, .order-items h3, .order-observations h3 { 
                    color: #000000; 
                    border-bottom: 1px solid #d1d5db; 
                    padding-bottom: 10px; 
                  }
                  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
                  .info-item { margin-bottom: 10px; }
                  .info-label { font-weight: bold; color: #6b7280; font-size: 12px; }
                  .info-value { margin-top: 2px; }
                  .item { border: 1px solid #d1d5db; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
                  .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                  .item-name { font-weight: bold; }
                  .item-code { color: #6b7280; font-size: 14px; }
                  .quantity { font-weight: bold; color: #000000; }
                  .item-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
                  .summary { 
                    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); 
                    padding: 20px; 
                    border-radius: 5px; 
                    text-align: center; 
                    border: 1px solid #f59e0b;
                  }
                  .total { font-size: 18px; font-weight: bold; color: #000000; }
                  .footer { 
                    margin-top: 40px; 
                    text-align: center; 
                    color: #6b7280; 
                    font-size: 12px; 
                    border-top: 1px solid #000000;
                    padding-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  ${logoHtml}
                  <div class="header-text">
                    <h1 style="color: #000000; margin: 0;">PEDIDO</h1>
                    <p style="margin: 5px 0;">Fecha: ${orderDate} - Hora: ${orderTime}</p>
                    ${orderResponse?.id ? `<p style="margin: 5px 0;">ID: ${orderResponse.id}</p>` : ""}
                  </div>
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
                        <div class="quantity">Cantidad: ${item.quantity} ${item.unit}</div>
                      </div>
                      ${
                        item.observations
                          ? `
                      <div class="item-details">
                        <div>
                          <div class="info-label">OBSERVACIONES</div>
                          <div class="info-value">${item.observations}</div>
                        </div>
                      </div>
                      `
                          : ""
                      }
                    </div>
                  `,
                    )
                    .join("")}
                </div>
                
                ${
                  orderObservations
                    ? `
                <div class="order-observations">
                  <h3>Observaciones del Pedido</h3>
                  <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 5px;">
                    ${orderObservations}
                  </div>
                </div>
                `
                    : ""
                }
                
                <div class="summary">
                  <div class="total">Total de Productos: ${totalItems}</div>
                  <p style="margin-top: 10px; color: #6b7280;">* Los precios se calcularán según la lista de precios vigente</p>
                </div>
                
                <div class="footer">
                  <p><strong>Molinos Indelma</strong></p>
                  <p>Pedido generado el ${orderDate} a las ${orderTime}</p>
                  <p>Sistema de Gestión de Pedidos</p>
                </div>
              </body>
              </html>
            `)

            iframeDoc.close()

            const htmlContent = iframeDoc.documentElement.outerHTML
            const blob = new Blob([htmlContent], { type: "text/html" })

            document.body.removeChild(iframe)
            resolve(blob)
          } else {
            reject(new Error("Could not access iframe document"))
          }
        }

        img.onerror = () => {
          reject(new Error("Could not load logo image"))
        }

        img.crossOrigin = "anonymous"
        img.src = "/images/indelma-logo.png"
      } catch (error) {
        reject(error)
      }
    })
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

          <div className="space-y-4">
            <Button className="w-full text-sm" onClick={handleViewOrder}>
              <FileText className="w-4 h-4 mr-2" />
              Ver Pedido
            </Button>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Compartir por:</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0 bg-transparent hover:bg-green-50 border-green-200 hover:border-green-300"
                  onClick={handleShareWhatsApp}
                  title="Compartir por WhatsApp"
                >
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0 bg-transparent hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                  onClick={handleShareEmail}
                  title="Compartir por Email"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            <Button variant="outline" className="text-sm bg-transparent" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resumen del Pedido
            </CardTitle>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="text-xs">Cliente</span>
              </div>
              <span className="hidden sm:inline">→</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Package className="w-3 h-3" />
                <span className="text-xs">Productos</span>
              </div>
              <span className="hidden sm:inline">→</span>
              <div className="flex items-center gap-1 text-primary font-medium">
                <FileText className="w-3 h-3" />
                <span className="text-xs">Resumen</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Cliente</h3>
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <h3 className="font-medium">Productos</h3>
              </div>
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </Badge>
            </div>

            <div className="space-y-3">
              {orderItems.map((item) => (
                <Card key={item.product.id} className="bg-gray-50/50 border-gray-200">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{item.product.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">Código: {item.product.code}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
                          <span className="text-xs text-muted-foreground sm:hidden">Cantidad:</span>
                          <Badge variant="outline" className="font-medium">
                            {item.quantity} {item.unit}
                          </Badge>
                        </div>
                      </div>

                      {item.observations && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-muted-foreground font-medium">Observaciones:</p>
                          <p className="text-sm text-gray-700 mt-1">{item.observations}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="order-observations" className="text-sm font-medium">
              Observaciones del Pedido
            </Label>
            <Input
              id="order-observations"
              type="text"
              placeholder="Observaciones generales del pedido..."
              value={orderObservations}
              onChange={(e) => setOrderObservations(e.target.value)}
              className="mt-2"
            />
          </div>

          <Separator />

          <div className="bg-green-50/50 border border-green-200 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="font-medium">Total de Productos:</span>
              <span className="font-bold text-lg text-green-700">{totalItems}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              * Los precios se calcularán según la lista de precios vigente
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="order-2 sm:order-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Productos
        </Button>

        <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="min-w-32 order-1 sm:order-2">
          {isSubmitting ? "Guardando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  )
}
