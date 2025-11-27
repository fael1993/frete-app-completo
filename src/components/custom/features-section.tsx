"use client"

import { ShieldCheck, MapPin, Lock, Headphones, Truck, Clock } from "lucide-react"

// Princípio de Chunking: 6 features agrupadas em 2 linhas de 3
const features = [
  {
    icon: ShieldCheck,
    title: "Transportadores Verificados",
    description: "Todos os transportadores passam por verificação rigorosa de documentos, seguros e licenças europeias (CMR, ADR).",
    color: "blue",
  },
  {
    icon: MapPin,
    title: "Rastreamento em Tempo Real",
    description: "Acompanhe sua carga em tempo real com GPS, notificações automáticas e histórico completo de rota.",
    color: "green",
  },
  {
    icon: Lock,
    title: "Pagamento Seguro",
    description: "Transações protegidas com escrow, conformidade PSD2 e suporte a SEPA para toda a União Europeia.",
    color: "purple",
  },
  {
    icon: Truck,
    title: "Frota Diversificada",
    description: "Desde carrinhas a camiões articulados. Encontre o veículo ideal para qualquer tipo de carga.",
    color: "orange",
  },
  {
    icon: Clock,
    title: "Respostas Rápidas",
    description: "Receba propostas de transportadores em menos de 2 horas. Agilidade para suas operações.",
    color: "cyan",
  },
  {
    icon: Headphones,
    title: "Suporte Multilingue 24/7",
    description: "Equipa disponível em português, espanhol, inglês e francês. Sempre que precisar.",
    color: "pink",
  },
]

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-600",
  pink: "from-pink-500 to-pink-600",
}

export function FeaturesSection() {
  return (
    <section id="vantagens" className="py-16 sm:py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Header - Hierarquia visual clara */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Por que escolher a{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              BoxFreight EU
            </span>
            ?
          </h2>
          <p className="text-lg text-gray-600">
            Tecnologia, segurança e transparência para o transporte de cargas na Europa
          </p>
        </div>

        {/* Grid de Features - Gestalt: agrupamento visual */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1"
              >
                {/* Ícone - Efeito Von Restorff (destaque) */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    colorClasses[feature.color as keyof typeof colorClasses]
                  } flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Conteúdo - Hierarquia tipográfica */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect - Micro-interação */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            )
          })}
        </div>

        {/* Trust Bar - Prova social adicional */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">2.500+</p>
              <p className="text-gray-600 font-medium">Transportadores</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">15.000+</p>
              <p className="text-gray-600 font-medium">Rotas Ativas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">27</p>
              <p className="text-gray-600 font-medium">Países UE</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600 mb-2">98%</p>
              <p className="text-gray-600 font-medium">Satisfação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
