import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockProducts = [
      { id: 1, code: "PROD001", name: "Laptop Dell Inspiron 15" },
      { id: 2, code: "PROD002", name: "Mouse Logitech MX Master 3" },
      { id: 3, code: "PROD003", name: "Teclado Mecánico Corsair K95" },
      { id: 4, code: "PROD004", name: "Monitor Samsung 27 4K" },
      { id: 5, code: "PROD005", name: "Webcam Logitech C920" },
      { id: 6, code: "PROD006", name: "Auriculares Sony WH-1000XM4" },
      { id: 7, code: "PROD007", name: "Tablet iPad Air 10.9" },
      { id: 8, code: "PROD008", name: "Smartphone iPhone 15" },
      { id: 9, code: "PROD009", name: "Impresora HP LaserJet Pro" },
      { id: 10, code: "PROD010", name: "Disco SSD Samsung 1TB" },
    ]

    console.log("[v0] Products requested, returning", mockProducts.length, "products")

    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error("[v0] Error fetching products:", error)

    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}
