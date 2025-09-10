"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SplashScreenProps {
  onEnter: () => void
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="animate-pattern absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-xl"></div>
        <div
          className="animate-pattern absolute top-32 right-20 w-24 h-24 bg-secondary rounded-full blur-lg"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="animate-pattern absolute bottom-20 left-32 w-40 h-40 bg-accent rounded-full blur-2xl"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="animate-pattern absolute bottom-40 right-10 w-28 h-28 bg-primary rounded-full blur-lg"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-foreground" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 animate-slide-in">
          <div className="animate-float">
            <div className="relative mx-auto w-48 h-48 mb-8">
              <Image
                src="/images/vecta-logo.png"
                alt="Vecta Logo"
                fill
                className="object-contain animate-pulse-glow rounded-2xl"
                priority
              />
            </div>
          </div>

          <div className="space-y-4" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Bienvenido a <span className="text-primary">Vecta</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La plataforma más eficiente para gestionar tus pedidos y hacer crecer tu negocio
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Gestión Rápida</h3>
              <p className="text-sm text-muted-foreground">Crea pedidos en segundos con nuestro sistema intuitivo</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Clientes Organizados</h3>
              <p className="text-sm text-muted-foreground">Mantén toda la información de tus clientes al alcance</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Reportes Claros</h3>
              <p className="text-sm text-muted-foreground">Visualiza el progreso de tus pedidos en tiempo real</p>
            </div>
          </div>

          <div className="mt-12" style={{ animationDelay: "0.6s" }}>
            <Button
              onClick={onEnter}
              size="lg"
              className="px-12 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Entrar a la Aplicación
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
