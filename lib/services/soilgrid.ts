export interface SoilGridData {
  organic_carbon: number; // g/kg
  clay_content: number; // %
  sand_content: number; // %
  silt_content: number; // %
  bulk_density: number; // g/cm³
  ph: number;
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
}

export interface SoilGridResponse {
  success: boolean;
  message: string;
  data?: SoilGridData;
}

// SoilGrids API base URL
const SOILGRIDS_BASE_URL = 'https://rest.isric.org/soilgrids/v2.0';

// Property mappings for SoilGrids API
const SOIL_PROPERTIES = {
  'clay': 'clay',
  'sand': 'sand', 
  'silt': 'silt',
  'ocd': 'organic_carbon', // Organic Carbon Density
  'bdod': 'bulk_density', // Bulk Density
  'phh2o': 'ph', // pH in water
  'nitrogen': 'nitrogen', // Total Nitrogen
  'cec': 'cation_exchange' // Cation Exchange Capacity (can estimate P/K)
};

// Convert SoilGrids units to standard units
const convertSoilGridsValue = (property: string, value: number): number => {
  switch (property) {
    case 'clay':
    case 'sand':
    case 'silt':
      return value / 10; // Convert from g/kg to percentage
    case 'ocd':
      return value / 10; // Convert from dg/kg to g/kg
    case 'bdod':
      return value / 100; // Convert from cg/cm³ to g/cm³
    case 'phh2o':
      return value / 10; // Convert from pH*10 to pH
    case 'nitrogen':
      return value * 14; // Estimate from organic carbon (rough conversion)
    default:
      return value;
  }
};

// Fetch soil data from SoilGrids API
export const getSoilData = async (latitude: number, longitude: number): Promise<SoilGridResponse> => {
  try {
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        success: false,
        message: 'Invalid coordinates provided'
      };
    }

    // Build properties query for SoilGrids API
    const properties = ['clay', 'sand', 'silt', 'ocd', 'bdod', 'phh2o'];
    const depth = '0-5cm'; // Surface layer
    const values = 'mean'; // Get mean values

    const propertyQuery = properties.join('&property=');
    const url = `${SOILGRIDS_BASE_URL}/properties/query?lon=${longitude}&lat=${latitude}&property=${propertyQuery}&depth=${depth}&value=${values}`;

    console.log('Fetching soil data from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CropPredict-App/1.0'
      }
    });

    if (!response.ok) {
      // If SoilGrids API fails, return mock data for demo
      console.warn('SoilGrids API failed, using mock data');
      return getMockSoilData(latitude, longitude);
    }

    const data = await response.json();

    if (!data.properties || !data.properties.layers) {
      return getMockSoilData(latitude, longitude);
    }

    // Parse SoilGrids response
    const soilData: Partial<SoilGridData> = {};
    
    data.properties.layers.forEach((layer: any) => {
      const propertyName = layer.name;
      const depths = layer.depths[0]; // Use first depth (0-5cm)
      
      if (depths && depths.values) {
        const value = convertSoilGridsValue(propertyName, depths.values.mean);
        
        switch (propertyName) {
          case 'clay':
            soilData.clay_content = value;
            break;
          case 'sand':
            soilData.sand_content = value;
            break;
          case 'silt':
            soilData.silt_content = value;
            break;
          case 'ocd':
            soilData.organic_carbon = value;
            break;
          case 'bdod':
            soilData.bulk_density = value;
            break;
          case 'phh2o':
            soilData.ph = value;
            break;
        }
      }
    });

    // Estimate nutrients based on soil properties
    const estimatedNutrients = estimateNutrients(soilData as SoilGridData);
    
    const completeSoilData: SoilGridData = {
      organic_carbon: soilData.organic_carbon || 15,
      clay_content: soilData.clay_content || 25,
      sand_content: soilData.sand_content || 45,
      silt_content: soilData.silt_content || 30,
      bulk_density: soilData.bulk_density || 1.3,
      ph: soilData.ph || 6.5,
      ...estimatedNutrients
    };

    return {
      success: true,
      message: 'Soil data retrieved successfully from SoilGrids',
      data: completeSoilData
    };

  } catch (error) {
    console.error('SoilGrids API error:', error);
    // Return mock data as fallback
    return getMockSoilData(latitude, longitude);
  }
};

// Estimate nutrients based on soil properties
const estimateNutrients = (soilData: Partial<SoilGridData>) => {
  const organicCarbon = soilData.organic_carbon || 15;
  const clayContent = soilData.clay_content || 25;
  const ph = soilData.ph || 6.5;

  // Rough estimation formulas based on soil science
  const nitrogen = Math.round(organicCarbon * 0.8 + clayContent * 0.5); // mg/kg
  const phosphorus = Math.round(clayContent * 1.2 + (ph > 7 ? 10 : -5)); // mg/kg
  const potassium = Math.round(clayContent * 2.5 + organicCarbon * 0.3); // mg/kg

  return {
    nitrogen: Math.max(10, Math.min(nitrogen, 80)), // Clamp between 10-80
    phosphorus: Math.max(5, Math.min(phosphorus, 70)), // Clamp between 5-70  
    potassium: Math.max(10, Math.min(potassium, 150)) // Clamp between 10-150
  };
};

// Generate mock soil data for demo purposes or API fallback
const getMockSoilData = (latitude: number, longitude: number): SoilGridResponse => {
  // Generate realistic mock data based on geographic region
  const isNorthern = latitude > 30;
  const isTropical = Math.abs(latitude) < 23.5;
  const isCoastal = Math.abs(longitude) % 5 < 2; // Rough coastal approximation

  let baseData = {
    organic_carbon: 15,
    clay_content: 25,
    sand_content: 45,
    silt_content: 30,
    bulk_density: 1.3,
    ph: 6.5,
    nitrogen: 40,
    phosphorus: 30,
    potassium: 60
  };

  // Adjust based on climate/region
  if (isTropical) {
    baseData.organic_carbon *= 0.8; // Lower organic matter in tropics
    baseData.ph += 0.5; // Slightly more alkaline
  }

  if (isNorthern) {
    baseData.organic_carbon *= 1.3; // Higher organic matter in northern regions
    baseData.nitrogen *= 1.2;
  }

  if (isCoastal) {
    baseData.sand_content *= 1.2; // More sandy near coasts
    baseData.clay_content *= 0.8;
  }

  // Add some randomization for realism
  Object.keys(baseData).forEach(key => {
    if (key !== 'ph') {
      baseData[key as keyof typeof baseData] *= (0.9 + Math.random() * 0.2);
    }
  });

  // Round values
  const mockData: SoilGridData = {
    organic_carbon: Math.round(baseData.organic_carbon * 10) / 10,
    clay_content: Math.round(baseData.clay_content),
    sand_content: Math.round(baseData.sand_content),
    silt_content: Math.round(baseData.silt_content),
    bulk_density: Math.round(baseData.bulk_density * 100) / 100,
    ph: Math.round(baseData.ph * 10) / 10,
    nitrogen: Math.round(baseData.nitrogen),
    phosphorus: Math.round(baseData.phosphorus),
    potassium: Math.round(baseData.potassium)
  };

  return {
    success: true,
    message: 'Mock soil data generated (SoilGrids API unavailable)',
    data: mockData
  };
};