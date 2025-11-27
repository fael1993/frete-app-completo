"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
      {/* Background com gradiente - Efeito Von Restorff (destaque máximo) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Efeitos visuais - neurociência: movimento atrai atenção */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Urgência/Escassez (neurociência) */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/30">
            <Sparkles className="w-4 h-4" />
            <span>Oferta de Lançamento: Primeiros 3 meses sem comissão</span>
          </div>

          {/* Headline - Contraste máximo para legibilidade */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Pronto para Revolucionar o Seu Transporte de Cargas?
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já economizam tempo e dinheiro com a BoxFreight EU.
            Registo gratuito, sem compromisso.
          </p>

          {/* CTAs - Lei de Fitts: botões grandes */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg px-10 py-7 group font-bold"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm text-lg px-10 py-7"
            >
              Agendar Demonstração
            </Button>
          </div>

          {/* Trust signals - Redução de fricção */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-10 text-blue-100">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Configuração em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancele quando quiser</span>
            </div>
          </div>

          {/* Social proof final */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 text-sm mb-4">
              Empresas que já confiam na BoxFreight EU:
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {["TechParts", "FreshFood", "AutoParts", "LogiTrans", "EuroFreight"].map((company, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20 text-white font-semibold text-sm"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
