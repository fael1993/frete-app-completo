"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Weight,
  Euro,
  FileText,
  CheckCircle2
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NovaCargarPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    weight: "",
    originCity: "",
    originCountry: "",
    destinationCity: "",
    destinationCountry: "",
    pickupDate: "",
    deliveryDate: "",
    price: "",
    vehicleType: ""
  })

  useEffect(() => {
    const token = localStorage.getItem("boxfreight_token")
    const userData = localStorage.getItem("boxfreight_user")
    
    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "SHIPPER") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulação de criação de carga
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/cargas")
      }, 2000)
    } catch (error) {
      console.error("Erro ao criar carga:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Carga Publicada!</h2>
            <p className="text-gray-600 mb-4">
              Sua carga foi publicada com sucesso. Você receberá propostas de transportadores em breve.
            </p>
            <p className="text-sm text-gray-500">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Publicar Nova Carga</h1>
              <p className="text-sm text-gray-600">Preencha os detalhes da sua carga</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações da Carga
                </CardTitle>
                <CardDescription>Descreva o que será transportado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Carga *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Paletes de Eletrônicos"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o conteúdo, embalagem, cuidados especiais..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Carga *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Eletrônicos</SelectItem>
                        <SelectItem value="food">Alimentícios</SelectItem>
                        <SelectItem value="furniture">Móveis</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="textiles">Têxteis</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (toneladas) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origem e Destino */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Origem e Destino
                </CardTitle>
                <CardDescription>Defina os pontos de coleta e entrega</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originCity">Cidade de Origem *</Label>
                    <Input
                      id="originCity"
                      placeholder="Lisboa"
                      value={formData.originCity}
                      onChange={(e) => setFormData({...formData, originCity: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originCountry">País de Origem *</Label>
                    <Select value={formData.originCountry} onValueChange={(value) => setFormData({...formData, originCountry: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="ES">Espanha</SelectItem>
                        <SelectItem value="FR">França</SelectItem>
                        <SelectItem value="DE">Alemanha</SelectItem>
                        <SelectItem value="IT">Itália</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationCity">Cidade de Destino *</Label>
                    <Input
                      id="destinationCity"
                      placeholder="Madrid"
                      value={formData.destinationCity}
                      onChange={(e) => setFormData({...formData, destinationCity: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destinationCountry">País de Destino *</Label>
                    <Select value={formData.destinationCountry} onValueChange={(value) => setFormData({...formData, destinationCountry: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="ES">Espanha</SelectItem>
                        <SelectItem value="FR">França</SelectItem>
                        <SelectItem value="DE">Alemanha</SelectItem>
                        <SelectItem value="IT">Itália</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datas e Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datas e Valores
                </CardTitle>
                <CardDescription>Defina prazos e valor do frete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Data de Coleta *</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Data de Entrega *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Valor do Frete (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="850"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => setFormData({...formData, vehicleType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Caminhão</SelectItem>
                        <SelectItem value="semi">Semi-reboque</SelectItem>
                        <SelectItem value="refrigerated">Refrigerado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar Carga"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
