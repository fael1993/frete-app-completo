// Constantes da marca BoxFreight EU
// Baseado em neurociência e psicologia das cores para público europeu

export const BRAND = {
  name: "BoxFreight EU",
  tagline: "Transporte Inteligente pela Europa",
  description: "Conectamos embarcadores e transportadores verificados em toda a União Europeia",
}

// Cores baseadas em neurociência:
// Azul: confiança, segurança, profissionalismo (cor da UE)
// Verde: sustentabilidade, crescimento, aprovação
// Laranja: ação, urgência, conversão
export const COLORS = {
  primary: "#0066CC", // Azul UE - confiança
  secondary: "#10B981", // Verde - sustentabilidade
  accent: "#F59E0B", // Laranja - call-to-action
  neutral: "#1F2937", // Cinza escuro - texto
}

// Países suportados (UE + UK)
export const SUPPORTED_COUNTRIES = [
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "FR", name: "França", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "IT", name: "Itália", flag: "🇮🇹" },
  { code: "NL", name: "Países Baixos", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "PL", name: "Polónia", flag: "🇵🇱" },
]

// Estatísticas (prova social - neurociência da confiança)
export const STATS = {
  transporters: "2.500+",
  routes: "15.000+",
  countries: "27",
  satisfaction: "98%",
}

// Benefícios (chunking: 3-4 itens por grupo)
export const FEATURES = [
  {
    title: "Transportadores Verificados",
    description: "Todos os transportadores passam por verificação rigorosa de documentos e seguros",
    icon: "shield-check",
  },
  {
    title: "Rastreamento em Tempo Real",
    description: "Acompanhe sua carga em tempo real com GPS e atualizações automáticas",
    icon: "map-pin",
  },
  {
    title: "Pagamento Seguro",
    description: "Transações protegidas com escrow e conformidade PSD2 europeia",
    icon: "lock",
  },
  {
    title: "Suporte 24/7",
    description: "Equipa multilingue disponível em português, espanhol, inglês e francês",
    icon: "headphones",
  },
]

// Processo simplificado (Lei de Hick: menos opções = decisões mais rápidas)
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Publique a Carga",
    description: "Insira origem, destino, peso e dimensões em menos de 2 minutos",
  },
  {
    step: 2,
    title: "Receba Propostas",
    description: "Transportadores verificados enviam propostas competitivas",
  },
  {
    step: 3,
    title: "Escolha e Acompanhe",
    description: "Selecione a melhor oferta e rastreie em tempo real até a entrega",
  },
]

// Regulamentos europeus suportados
export const COMPLIANCE = [
  "RGPD / GDPR",
  "CMR (Transporte Rodoviário)",
  "ADR (Mercadorias Perigosas)",
  "PSD2 (Pagamentos)",
  "eIDAS (Assinatura Digital)",
]
