// ============================================
// Freight Service - Cálculo de Preços
// ============================================

/**
 * Tabela de zonas e taxas base (EUR/km)
 * Baseado em distâncias e complexidade de rotas na UE
 */
const ZONE_RATES = {
  // Zona 1: Portugal, Espanha
  ZONE_1: {
    countries: ['PT', 'ES'],
    baseRate: 0.85, // EUR/km
  },
  // Zona 2: França, Bélgica, Holanda, Luxemburgo
  ZONE_2: {
    countries: ['FR', 'BE', 'NL', 'LU'],
    baseRate: 0.95,
  },
  // Zona 3: Alemanha, Áustria, Suíça
  ZONE_3: {
    countries: ['DE', 'AT', 'CH'],
    baseRate: 1.05,
  },
  // Zona 4: Itália, Grécia
  ZONE_4: {
    countries: ['IT', 'GR'],
    baseRate: 0.90,
  },
  // Zona 5: Europa Central (PL, CZ, HU, SK, SI, HR)
  ZONE_5: {
    countries: ['PL', 'CZ', 'HU', 'SK', 'SI', 'HR'],
    baseRate: 0.75,
  },
  // Zona 6: Europa do Norte (DK, SE, FI, NO)
  ZONE_6: {
    countries: ['DK', 'SE', 'FI', 'NO'],
    baseRate: 1.15,
  },
  // Zona 7: Bálticos (EE, LV, LT)
  ZONE_7: {
    countries: ['EE', 'LV', 'LT'],
    baseRate: 0.80,
  },
  // Zona 8: Europa do Leste (RO, BG)
  ZONE_8: {
    countries: ['RO', 'BG'],
    baseRate: 0.70,
  },
};

/**
 * Multiplicadores por tipo de carga
 */
const LOAD_TYPE_MULTIPLIERS = {
  GENERAL: 1.0,
  PALLETIZED: 1.1,
  REFRIGERATED: 1.4,
  FRAGILE: 1.2,
  HAZARDOUS: 1.8, // ADR
  OVERSIZED: 1.5,
  LIQUID: 1.3,
  BULK: 1.15,
};

/**
 * Multiplicador por peso (escala progressiva)
 */
const getWeightMultiplier = (weight) => {
  if (weight <= 1000) return 1.0;
  if (weight <= 5000) return 1.1;
  if (weight <= 10000) return 1.2;
  if (weight <= 20000) return 1.3;
  return 1.4;
};

/**
 * Multiplicador para rotas internacionais
 */
const INTERNATIONAL_MULTIPLIER = 1.25;

/**
 * Taxa de IVA padrão (Portugal)
 */
const VAT_RATE = 0.23; // 23%

/**
 * Comissão da plataforma
 */
const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%

/**
 * Calcular preço de frete
 * @param {object} params - Parâmetros da carga
 * @returns {number} - Preço em EUR
 */
export const calculateFreightPrice = (params) => {
  const {
    distance,
    weight,
    loadType = 'GENERAL',
    originCountry,
    destCountry,
    requiresInsurance = false,
    requiresCMR = false,
    requiresADR = false,
  } = params;
  
  // Determinar zona de origem e destino
  const originZone = getCountryZone(originCountry);
  const destZone = getCountryZone(destCountry);
  
  // Taxa base média entre as duas zonas
  const baseRate = (originZone.baseRate + destZone.baseRate) / 2;
  
  // Preço base: distância × taxa base
  let price = distance * baseRate;
  
  // Aplicar multiplicador de tipo de carga
  const loadTypeMultiplier = LOAD_TYPE_MULTIPLIERS[loadType] || 1.0;
  price *= loadTypeMultiplier;
  
  // Aplicar multiplicador de peso
  const weightMultiplier = getWeightMultiplier(weight);
  price *= weightMultiplier;
  
  // Rota internacional (países diferentes)
  if (originCountry !== destCountry) {
    price *= INTERNATIONAL_MULTIPLIER;
  }
  
  // Requisitos adicionais
  if (requiresInsurance) {
    price += 50; // Taxa fixa de seguro
  }
  
  if (requiresCMR) {
    price += 30; // Taxa CMR
  }
  
  if (requiresADR) {
    price += 100; // Taxa ADR (mercadorias perigosas)
  }
  
  // Arredondar para 2 casas decimais
  return Math.round(price * 100) / 100;
};

/**
 * Calcular breakdown detalhado do preço
 * @param {object} params - Parâmetros da carga
 * @returns {object} - Breakdown detalhado
 */
export const calculatePriceBreakdown = (params) => {
  const basePrice = calculateFreightPrice(params);
  
  const platformFee = Math.round(basePrice * PLATFORM_FEE_PERCENTAGE * 100) / 100;
  const subtotal = basePrice;
  const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  
  return {
    basePrice,
    platformFee,
    subtotal,
    vatRate: VAT_RATE * 100, // Percentagem
    vatAmount,
    total,
    currency: 'EUR',
  };
};

/**
 * Obter zona de um país
 * @param {string} countryCode - Código ISO do país
 * @returns {object} - Dados da zona
 */
function getCountryZone(countryCode) {
  for (const zone of Object.values(ZONE_RATES)) {
    if (zone.countries.includes(countryCode)) {
      return zone;
    }
  }
  
  // Fallback para zona padrão
  return ZONE_RATES.ZONE_1;
}

/**
 * Calcular preço estimado para matching
 * Usado para sugerir preços competitivos aos transportadores
 * @param {object} load - Dados da carga
 * @returns {object} - Range de preços sugeridos
 */
export const calculateSuggestedPriceRange = (load) => {
  const basePrice = calculateFreightPrice({
    distance: load.distance,
    weight: load.weight,
    loadType: load.loadType,
    originCountry: load.originCountry,
    destCountry: load.destCountry,
    requiresInsurance: load.requiresInsurance,
    requiresCMR: load.requiresCMR,
    requiresADR: load.requiresADR,
  });
  
  // Range de -15% a +10% do preço base
  const minPrice = Math.round(basePrice * 0.85 * 100) / 100;
  const maxPrice = Math.round(basePrice * 1.10 * 100) / 100;
  
  return {
    minPrice,
    suggestedPrice: basePrice,
    maxPrice,
    currency: 'EUR',
  };
};

/**
 * Calcular custo operacional estimado para o transportador
 * Ajuda a determinar se uma oferta é viável
 * @param {object} params - Parâmetros
 * @returns {object} - Custos estimados
 */
export const calculateOperationalCost = (params) => {
  const { distance, weight, vehicleType } = params;
  
  // Consumo médio de combustível por tipo de veículo (litros/100km)
  const fuelConsumption = {
    VAN: 8,
    TRUCK_3_5T: 12,
    TRUCK_7_5T: 18,
    TRUCK_12T: 22,
    TRUCK_18T: 28,
    TRUCK_24T: 32,
    SEMI_TRAILER: 35,
    REFRIGERATED: 40,
    TANKER: 38,
  };
  
  const consumption = fuelConsumption[vehicleType] || 25;
  const fuelPricePerLiter = 1.65; // EUR (média UE)
  
  const fuelCost = (distance / 100) * consumption * fuelPricePerLiter;
  const tollsCost = distance * 0.15; // Estimativa de portagens
  const maintenanceCost = distance * 0.08; // Manutenção
  const driverCost = (distance / 80) * 15; // Custo motorista (assumir 80km/h, 15 EUR/hora)
  
  const totalCost = fuelCost + tollsCost + maintenanceCost + driverCost;
  
  return {
    fuelCost: Math.round(fuelCost * 100) / 100,
    tollsCost: Math.round(tollsCost * 100) / 100,
    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
    driverCost: Math.round(driverCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    currency: 'EUR',
  };
};
