"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface IndelmaWelcomeProps {
  onEnter: () => void
}

export default function IndelmaWelcome({ onEnter }: IndelmaWelcomeProps) {
  const [isEntering, setIsEntering] = useState(false)

  const handleEnter = () => {
    setIsEntering(true)
    setTimeout(() => {
      onEnter()
    }, 500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-gentle-float" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-gentle-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/8 rounded-full blur-2xl animate-gentle-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        <div
          className={`text-center space-y-12 transition-all duration-500 ${isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        >
          {/* Logo */}
          <div className="animate-fade-in-up animate-gentle-float">
            <Image
              src="/images/indelma-logo.png"
              alt="Molinos Indelma"
              width={300}
              height={120}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>

          {/* Welcome message */}
          <div className="animate-fade-in-up space-y-4" style={{ animationDelay: "0.3s" }}>
            <h1 className="text-6xl font-bold text-foreground tracking-tight">Bienvenido</h1>
            <p className="text-4xl font-semibold text-primary">Oscar</p>
          </div>

          {/* Enter button */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button
              onClick={handleEnter}
              size="lg"
              className="px-12 py-6 text-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground animate-soft-glow transition-all duration-300 hover:scale-105"
              disabled={isEntering}
            >
              {isEntering ? "Ingresando..." : "Ingresar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
