"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Efeito de scroll (neurociência: feedback visual de posição)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Efeito Von Restorff (destaque visual) */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              BoxFreight EU
            </span>
          </Link>

          {/* Menu Desktop - Lei de Fitts: alvos grandes e próximos */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#como-funciona"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Como Funciona
            </Link>
            <Link
              href="#vantagens"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Vantagens
            </Link>
            <Link
              href="#precos"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Preços
            </Link>
            
            {/* CTAs - Hierarquia visual clara */}
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => router.push("/login")}
            >
              Entrar
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push("/register")}
            >
              Começar Grátis
            </Button>
          </div>

          {/* Menu Mobile - Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <Link
                href="#como-funciona"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link
                href="#vantagens"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vantagens
              </Link>
              <Link
                href="#precos"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Preços
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    router.push("/login")
                  }}
                >
                  Entrar
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    router.push("/register")
                  }}
                >
                  Começar Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
