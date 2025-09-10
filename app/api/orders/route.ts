import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Aquí podrías conectar con tu base de datos real
    // Por ahora simulamos el guardado exitoso

    console.log("[v0] Order received:", {
      id: orderId,
      client: orderData.client?.name,
      itemsCount: orderData.items?.length || 0,
    })

    // Simular un pequeño delay como si fuera una operación real
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      id: orderId,
      message: "Pedido guardado exitosamente",
      status: "success",
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error processing order:", error)

    return NextResponse.json(
      {
        error: "Error al procesar el pedido",
        message: "Hubo un problema al guardar el pedido. Inténtalo nuevamente.",
      },
      { status: 500 },
    )
  }
}
