// ============================================
// Geocoding Service - Mapbox Integration
// ============================================

import axios from 'axios';

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

/**
 * Geocode um endereço para coordenadas
 * @param {string} address - Endereço completo
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const geocodeAddress = async (address) => {
  if (!MAPBOX_API_KEY) {
    console.warn('MAPBOX_API_KEY não configurada. Retornando coordenadas mock.');
    return { lat: 38.7223, lng: -9.1393 }; // Lisboa como fallback
  }
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodedAddress}.json`;
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_API_KEY,
        limit: 1,
        types: 'address,place,postcode',
        country: 'PT,ES,FR,DE,IT,NL,BE,AT,PL,CZ,HU,RO,BG,GR,HR,SI,SK,LT,LV,EE,IE,DK,SE,FI,LU,MT,CY', // UE
      },
    });
    
    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return { lat, lng };
    }
    
    throw new Error('Endereço não encontrado');
  } catch (error) {
    console.error('Erro no geocoding:', error.message);
    throw new Error('Não foi possível geocodificar o endereço');
  }
};

/**
 * Reverse geocode - coordenadas para endereço
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (lat, lng) => {
  if (!MAPBOX_API_KEY) {
    return 'Endereço desconhecido';
  }
  
  try {
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lng},${lat}.json`;
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_API_KEY,
        limit: 1,
      },
    });
    
    if (response.data.features && response.data.features.length > 0) {
      return response.data.features[0].place_name;
    }
    
    return 'Endereço desconhecido';
  } catch (error) {
    console.error('Erro no reverse geocoding:', error.message);
    return 'Endereço desconhecido';
  }
};

/**
 * Calcular distância e duração entre dois pontos
 * @param {object} origin - {lat, lng}
 * @param {object} destination - {lat, lng}
 * @returns {Promise<{distance: number, duration: number}>}
 */
export const calculateDistance = async (origin, destination) => {
  if (!MAPBOX_API_KEY) {
    // Cálculo aproximado usando fórmula de Haversine
    const distance = haversineDistance(origin, destination);
    const duration = Math.round((distance / 80) * 60); // Assumir 80 km/h
    return { distance, duration };
  }
  
  try {
    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${coordinates}`;
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_API_KEY,
        geometries: 'geojson',
        overview: 'full',
      },
    });
    
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: Math.round(route.distance / 1000), // metros para km
        duration: Math.round(route.duration / 60), // segundos para minutos
      };
    }
    
    throw new Error('Rota não encontrada');
  } catch (error) {
    console.error('Erro ao calcular distância:', error.message);
    // Fallback para Haversine
    const distance = haversineDistance(origin, destination);
    const duration = Math.round((distance / 80) * 60);
    return { distance, duration };
  }
};

/**
 * Fórmula de Haversine para calcular distância entre coordenadas
 * @param {object} coord1 - {lat, lng}
 * @param {object} coord2 - {lat, lng}
 * @returns {number} - Distância em km
 */
function haversineDistance(coord1, coord2) {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Obter rota otimizada com múltiplos waypoints
 * @param {array} coordinates - Array de {lat, lng}
 * @returns {Promise<object>}
 */
export const getOptimizedRoute = async (coordinates) => {
  if (!MAPBOX_API_KEY || coordinates.length < 2) {
    throw new Error('Configuração inválida para otimização de rota');
  }
  
  try {
    const coordsString = coordinates
      .map(coord => `${coord.lng},${coord.lat}`)
      .join(';');
    
    const url = `${MAPBOX_BASE_URL}/optimized-trips/v1/mapbox/driving/${coordsString}`;
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_API_KEY,
        geometries: 'geojson',
        overview: 'full',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro na otimização de rota:', error.message);
    throw error;
  }
};
