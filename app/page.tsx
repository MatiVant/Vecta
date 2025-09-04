import { OrderForm } from "@/components/order-form"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Pedidos</h1>
            <p className="text-muted-foreground">Crea y gestiona pedidos de manera eficiente</p>
          </header>
          <OrderForm />
        </div>
      </div>
    </main>
  )
}
