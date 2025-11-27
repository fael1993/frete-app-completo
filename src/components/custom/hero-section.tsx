"use client"

import { ArrowRight, MapPin, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BRAND, STATS } from "@/lib/constants"

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 overflow-hidden">
      {/* Background Pattern - Gestalt: padrão visual sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 opacity-60" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo Principal - F-Pattern (leitura natural) */}
          <div className="space-y-8">
            {/* Badge - Prova social imediata */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Mais de {STATS.transporters} transportadores ativos</span>
            </div>

            {/* Headline - Neurociência: clareza + benefício em 3 segundos */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transporte de Cargas{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Simples e Seguro
              </span>{" "}
              pela Europa
            </h1>

            {/* Subheadline - Chunking: informação digerível */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Conecte-se com transportadores verificados em {STATS.countries} países.
              Publique sua carga, receba propostas e acompanhe em tempo real.
            </p>

            {/* CTAs - Lei de Fitts: botões grandes e próximos */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 group"
                onClick={() => router.push("/register")}
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
              >
                <MapPin className="mr-2 w-5 h-5" />
                Ver Rotas Disponíveis
              </Button>
            </div>

            {/* Trust Badges - Neurociência da confiança */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Registo gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Suporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Visual Hero - Imagem/Ilustração */}
          <div className="relative lg:h-[600px] hidden lg:block">
            {/* Placeholder para ilustração de camião/mapa Europa */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Ilustração: Mapa da Europa com rotas de transporte
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards - Prova social flutuante */}
            <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{STATS.routes}</p>
                  <p className="text-sm text-gray-600">Rotas Ativas</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{STATS.satisfaction}</p>
                  <p className="text-sm text-gray-600">Satisfação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
