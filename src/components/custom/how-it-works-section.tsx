"use client"

import { FileText, Search, CheckCircle } from "lucide-react"

// Lei de Hick: 3 passos simples (menos opções = decisões mais rápidas)
const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Publique a Carga",
    description: "Insira origem, destino, peso e dimensões. Leva menos de 2 minutos.",
    details: ["Formulário intuitivo", "Cálculo automático de distância", "Sugestão de preço"],
  },
  {
    number: 2,
    icon: Search,
    title: "Receba Propostas",
    description: "Transportadores verificados enviam propostas competitivas em até 2 horas.",
    details: ["Perfis verificados", "Avaliações reais", "Histórico transparente"],
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Escolha e Acompanhe",
    description: "Selecione a melhor oferta e rastreie em tempo real até a entrega.",
    details: ["GPS em tempo real", "Notificações automáticas", "Prova de entrega digital"],
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Como Funciona?
          </h2>
          <p className="text-lg text-gray-600">
            Processo simples e transparente em apenas 3 passos
          </p>
        </div>

        {/* Timeline - Visual progressivo */}
        <div className="relative max-w-5xl mx-auto">
          {/* Linha conectora - apenas desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-blue-200" />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group">
                    {/* Número do passo - Efeito Von Restorff */}
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>

                    {/* Ícone */}
                    <div className="mt-8 mb-6 w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Conteúdo */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Detalhes - Chunking de informação */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Seta conectora - apenas desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 -right-6 text-blue-300">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA secundário */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Pronto para começar? Registe-se gratuitamente em menos de 1 minuto
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Criar Conta Grátis
          </button>
        </div>
      </div>
    </section>
  )
}
