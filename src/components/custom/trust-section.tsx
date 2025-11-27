"use client"

import { Star, Quote } from "lucide-react"

// Prova social - neurociência da confiança
const testimonials = [
  {
    name: "João Silva",
    role: "Diretor de Logística",
    company: "TechParts Portugal",
    avatar: "JS",
    rating: 5,
    text: "Reduzimos custos de transporte em 30% e melhoramos a previsibilidade das entregas. A plataforma é intuitiva e o suporte é excelente.",
    country: "🇵🇹",
  },
  {
    name: "María García",
    role: "Gerente de Operações",
    company: "FreshFood España",
    avatar: "MG",
    rating: 5,
    text: "Transportamos produtos perecíveis e a rastreabilidade em tempo real nos dá total controlo. Recomendo a todos os embarcadores.",
    country: "🇪🇸",
  },
  {
    name: "Pierre Dubois",
    role: "CEO",
    company: "AutoParts France",
    avatar: "PD",
    rating: 5,
    text: "A verificação rigorosa dos transportadores nos dá segurança. Já realizamos mais de 200 transportes sem problemas.",
    country: "🇫🇷",
  },
]

const partners = [
  { name: "DHL", logo: "DHL" },
  { name: "Schenker", logo: "SCH" },
  { name: "Kuehne+Nagel", logo: "K+N" },
  { name: "DSV", logo: "DSV" },
  { name: "Geodis", logo: "GEO" },
]

export function TrustSection() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Confiado por Empresas em Toda a Europa
          </h2>
          <p className="text-lg text-gray-600">
            Mais de 5.000 empresas já transportam com segurança através da BoxFreight EU
          </p>
        </div>

        {/* Testimonials - Prova social (neurociência) */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-blue-200">
                <Quote className="w-12 h-12" />
              </div>

              {/* Rating - Efeito Von Restorff */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Texto */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Autor */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    {testimonial.name}
                    <span className="text-xl">{testimonial.country}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners - Prova social adicional */}
        <div className="border-t border-gray-200 pt-12">
          <p className="text-center text-gray-600 mb-8 font-medium">
            Parceiros e Integrações
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="w-24 h-24 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-gray-100 hover:border-blue-200 group"
              >
                <span className="text-gray-400 font-bold text-lg group-hover:text-blue-600 transition-colors">
                  {partner.logo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Badges - Confiança regulatória */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-900">RGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-900">ISO 27001</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-purple-900">PSD2 Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-orange-900">CMR Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
