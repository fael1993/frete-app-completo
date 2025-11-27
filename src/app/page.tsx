"use client"

import { HeroSection } from "@/components/custom/hero-section"
import { FeaturesSection } from "@/components/custom/features-section"
import { HowItWorksSection } from "@/components/custom/how-it-works-section"
import { TrustSection } from "@/components/custom/trust-section"
import { CTASection } from "@/components/custom/cta-section"
import { Footer } from "@/components/custom/footer"
import { Navbar } from "@/components/custom/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar fixa com efeito glassmorphism */}
      <Navbar />
      
      {/* Hero Section - Primeira impressão crítica (3 segundos) */}
      <HeroSection />
      
      {/* Features - Chunking de informação (3-4 itens por grupo) */}
      <FeaturesSection />
      
      {/* How It Works - Processo simplificado (Lei de Hick) */}
      <HowItWorksSection />
      
      {/* Trust Signals - Prova social (neurociência da confiança) */}
      <TrustSection />
      
      {/* CTA Final - Efeito Von Restorff (destaque) */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
