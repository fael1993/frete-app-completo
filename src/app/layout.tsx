import type { Metadata } from "next"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "BoxFreight EU - Transporte de Cargas Inteligente na Europa",
  description: "Plataforma europeia de transporte de cargas. Conecte embarcadores e transportadores em Portugal, Espanha e toda a União Europeia. Seguro, rápido e transparente.",
  keywords: "transporte cargas, logística europa, frete portugal, transportadoras UE",
  openGraph: {
    title: "BoxFreight EU - Transporte de Cargas na Europa",
    description: "Conecte-se com transportadores verificados em toda a União Europeia",
    locale: "pt_PT",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-PT" className="scroll-smooth">
      <head>
        <Script src="/lasy-bridge.js" strategy="beforeInteractive" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
