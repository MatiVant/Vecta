"use client"

import { useState } from "react"
import { OrderForm } from "@/components/order-form"
import IndelmaWelcome from "@/components/indelma-welcome"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  const handleEnterApp = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <IndelmaWelcome onEnter={handleEnterApp} />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Pedidos - Molinos Indelma</h1>
            <p className="text-muted-foreground">Crea y gestiona pedidos de manera eficiente</p>
          </header>
          <OrderForm />
        </div>
      </div>
    </main>
  )
}
