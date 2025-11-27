"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  MapPin, 
  Euro,
  Search,
  Filter,
  Truck,
  Calendar,
  Weight,
  ArrowLeft
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Load {
  id: number
  title: string
  origin: string
  destination: string
  weight: number
  price: number
  date: string
  status: string
  type: string
}

export default function CargasPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [loads, setLoads] = useState<Load[]>([
    {
      id: 1231,
      title: "Paletes de Eletrônicos",
      origin: "Lisboa, Portugal",
      destination: "Madrid, Espanha",
      weight: 2.5,
      price: 850,
      date: "2024-01-20",
      status: "available",
      type: "electronics"
    },
    {
      id: 1232,
      title: "Produtos Alimentícios",
      origin: "Porto, Portugal",
      destination: "Barcelona, Espanha",
      weight: 5.0,
      price: 1200,
      date: "2024-01-22",
      status: "available",
      type: "food"
    },
    {
      id: 1233,
      title: "Móveis e Decoração",
      origin: "Coimbra, Portugal",
      destination: "Paris, França",
      weight: 8.0,
      price: 2100,
      date: "2024-01-25",
      status: "available",
      type: "furniture"
    },
    {
      id: 1234,
      title: "Equipamentos Industriais",
      origin: "Braga, Portugal",
      destination: "Berlim, Alemanha",
      weight: 12.0,
      price: 3500,
      date: "2024-01-28",
      status: "available",
      type: "industrial"
    },
    {
      id: 1235,
      title: "Produtos Têxteis",
      origin: "Faro, Portugal",
      destination: "Roma, Itália",
      weight: 3.5,
      price: 950,
      date: "2024-01-23",
      status: "available",
      type: "textiles"
    }
  ])

  useEffect(() => {
    const token = localStorage.getItem("boxfreight_token")
    const userData = localStorage.getItem("boxfreight_user")
    
    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || load.type === filterType
    return matchesSearch && matchesFilter
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isShipper = user.role === "SHIPPER"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isShipper ? "Minhas Cargas" : "Cargas Disponíveis"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isShipper ? "Gerencie suas cargas publicadas" : "Encontre cargas para transportar"}
                </p>
              </div>
            </div>
            {isShipper && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700"
                onClick={() => router.push("/cargas/nova")}
              >
                <Package className="mr-2 h-4 w-4" />
                Nova Carga
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por origem, destino ou tipo de carga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="electronics">Eletrônicos</SelectItem>
                  <SelectItem value="food">Alimentícios</SelectItem>
                  <SelectItem value="furniture">Móveis</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="textiles">Têxteis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredLoads.length} {filteredLoads.length === 1 ? "carga encontrada" : "cargas encontradas"}
          </p>
        </div>

        {/* Loads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLoads.map((load) => (
            <Card key={load.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{load.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Disponível
                      </Badge>
                    </div>
                    <CardDescription>Carga #{load.id}</CardDescription>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{load.origin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{load.destination}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <Weight className="h-3 w-3" />
                      Peso
                    </div>
                    <span className="font-semibold text-sm">{load.weight} ton</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <Calendar className="h-3 w-3" />
                      Data
                    </div>
                    <span className="font-semibold text-sm">
                      {new Date(load.date).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <Euro className="h-3 w-3" />
                      Valor
                    </div>
                    <span className="font-semibold text-sm text-green-600">€{load.price}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Ver Detalhes
                  </Button>
                  {!isShipper && (
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700">
                      <Truck className="mr-2 h-4 w-4" />
                      Fazer Proposta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLoads.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma carga encontrada</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setFilterType("all")
            }}>
              Limpar Filtros
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}
