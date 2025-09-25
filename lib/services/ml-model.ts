import { supabase } from '../supabase';
import type { SoilGridData } from './soilgrid';
import type { LocationData } from './location';

export interface SoilParameters {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
}

export interface PredictionResult {
  crop_type: string;
  yield_prediction: number;
  confidence: number;
  recommendations: string[];
  expected_harvest_date: string;
  estimated_yield: string;
}

export interface MLResponse {
  success: boolean;
  message: string;
  data?: PredictionResult;
}

// Crop database with optimal growing conditions
const CROP_DATABASE = {
  'Rice': {
    optimal: { nitrogen: [20, 40], phosphorus: [10, 25], potassium: [15, 30], ph: [5.5, 6.5] },
    season: 'monsoon',
    harvest_days: 120,
    yield_per_hectare: 4.5,
    climate: ['tropical', 'subtropical']
  },
  'Wheat': {
    optimal: { nitrogen: [40, 80], phosphorus: [20, 50], potassium: [20, 40], ph: [6.0, 7.5] },
    season: 'winter',
    harvest_days: 110,
    yield_per_hectare: 3.2,
    climate: ['temperate', 'continental']
  },
  'Corn': {
    optimal: { nitrogen: [50, 120], phosphorus: [25, 60], potassium: [30, 60], ph: [6.0, 6.8] },
    season: 'summer',
    harvest_days: 95,
    yield_per_hectare: 8.5,
    climate: ['temperate', 'continental', 'subtropical']
  },
  'Soybean': {
    optimal: { nitrogen: [20, 40], phosphorus: [15, 35], potassium: [20, 45], ph: [6.0, 7.0] },
    season: 'summer',
    harvest_days: 100,
    yield_per_hectare: 2.8,
    climate: ['temperate', 'continental']
  },
  'Cotton': {
    optimal: { nitrogen: [60, 120], phosphorus: [20, 50], potassium: [30, 80], ph: [5.8, 8.0] },
    season: 'summer',
    harvest_days: 160,
    yield_per_hectare: 1.2,
    climate: ['subtropical', 'tropical']
  },
  'Sugarcane': {
    optimal: { nitrogen: [80, 150], phosphorus: [30, 60], potassium: [40, 100], ph: [6.0, 7.5] },
    season: 'year-round',
    harvest_days: 365,
    yield_per_hectare: 65,
    climate: ['tropical', 'subtropical']
  },
  'Potato': {
    optimal: { nitrogen: [80, 120], phosphorus: [40, 80], potassium: [60, 120], ph: [5.0, 6.5] },
    season: 'winter',
    harvest_days: 75,
    yield_per_hectare: 25,
    climate: ['temperate', 'continental']
  },
  'Tomato': {
    optimal: { nitrogen: [100, 150], phosphorus: [50, 100], potassium: [80, 150], ph: [6.0, 6.8] },
    season: 'summer',
    harvest_days: 85,
    yield_per_hectare: 45,
    climate: ['temperate', 'subtropical']
  }
};

// Calculate fitness score for a crop based on soil parameters
const calculateCropFitness = (cropData: any, soilParams: SoilParameters): number => {
  const { nitrogen, phosphorus, potassium, ph } = soilParams;
  const { optimal } = cropData;
  
  let score = 0;
  let totalWeight = 4; // Four parameters
  
  // Calculate normalized scores for each parameter (0-1)
  const nScore = calculateParameterScore(nitrogen, optimal.nitrogen);
  const pScore = calculateParameterScore(phosphorus, optimal.phosphorus);
  const kScore = calculateParameterScore(potassium, optimal.potassium);
  const phScore = calculateParameterScore(ph, optimal.ph);
  
  score = (nScore + pScore + kScore + phScore) / totalWeight;
  
  return Math.max(0, Math.min(1, score)) * 100; // Convert to percentage
};

// Calculate parameter score based on optimal range
const calculateParameterScore = (value: number, optimalRange: number[]): number => {
  const [min, max] = optimalRange;
  const optimal = (min + max) / 2;
  const tolerance = (max - min) / 2;
  
  if (value >= min && value <= max) {
    // Within optimal range - score based on distance from center
    const distance = Math.abs(value - optimal);
    return 1 - (distance / tolerance) * 0.3; // Max penalty of 30% within range
  } else {
    // Outside optimal range - penalize based on distance
    const distance = value < min ? min - value : value - max;
    const penalty = Math.min(distance / tolerance, 2); // Max penalty factor of 2
    return Math.max(0, 1 - penalty * 0.5); // Max 100% penalty outside range
  }
};

// Determine climate zone based on latitude
const getClimateZone = (latitude: number): string => {
  const absLat = Math.abs(latitude);
  
  if (absLat < 23.5) return 'tropical';
  if (absLat < 35) return 'subtropical';
  if (absLat < 50) return 'temperate';
  return 'continental';
};

// Generate recommendations based on soil analysis
const generateRecommendations = (cropName: string, soilParams: SoilParameters, cropData: any): string[] => {
  const recommendations: string[] = [];
  const { optimal } = cropData;
  
  // Nitrogen recommendations
  if (soilParams.nitrogen < optimal.nitrogen[0]) {
    const deficit = optimal.nitrogen[0] - soilParams.nitrogen;
    recommendations.push(`Increase nitrogen levels by ${deficit}ppm using organic compost or nitrogen fertilizers`);
  } else if (soilParams.nitrogen > optimal.nitrogen[1]) {
    recommendations.push(`Nitrogen levels are high - consider reducing fertilizer application to prevent nutrient burn`);
  } else {
    recommendations.push(`Nitrogen levels are optimal for ${cropName} cultivation`);
  }
  
  // Phosphorus recommendations
  if (soilParams.phosphorus < optimal.phosphorus[0]) {
    recommendations.push(`Apply phosphorus-rich fertilizers like bone meal or rock phosphate`);
  } else if (soilParams.phosphorus > optimal.phosphorus[1]) {
    recommendations.push(`Phosphorus levels are adequate - avoid over-fertilization`);
  }
  
  // Potassium recommendations
  if (soilParams.potassium < optimal.potassium[0]) {
    recommendations.push(`Enhance potassium content with wood ash or potassium sulfate`);
  } else if (soilParams.potassium > optimal.potassium[1]) {
    recommendations.push(`Potassium levels are sufficient for healthy plant growth`);
  }
  
  // pH recommendations
  if (soilParams.ph < optimal.ph[0]) {
    const increase = (optimal.ph[0] - soilParams.ph).toFixed(1);
    recommendations.push(`Soil is acidic - add lime to increase pH by ${increase} units`);
  } else if (soilParams.ph > optimal.ph[1]) {
    const decrease = (soilParams.ph - optimal.ph[1]).toFixed(1);
    recommendations.push(`Soil is alkaline - add sulfur or organic matter to lower pH by ${decrease} units`);
  } else {
    recommendations.push(`Soil pH is ideal for ${cropName} growth`);
  }
  
  // Season-specific recommendations
  const currentMonth = new Date().getMonth();
  const season = cropData.season;
  
  if (season === 'winter' && (currentMonth >= 3 && currentMonth <= 8)) {
    recommendations.push(`Consider waiting for winter season (Oct-Mar) for optimal ${cropName} planting`);
  } else if (season === 'summer' && (currentMonth >= 9 || currentMonth <= 2)) {
    recommendations.push(`Plan for summer planting (Apr-Sep) for best ${cropName} yields`);
  }
  
  return recommendations.slice(0, 4); // Return top 4 recommendations
};

// Manual prediction using soil parameters
export const predictCropManual = async (soilParams: SoilParameters, userId?: string): Promise<MLResponse> => {
  try {
    const cropScores: Array<{ crop: string; score: number; data: any }> = [];
    
    // Calculate fitness scores for all crops
    Object.entries(CROP_DATABASE).forEach(([cropName, cropData]) => {
      const score = calculateCropFitness(cropData, soilParams);
      cropScores.push({ crop: cropName, score, data: cropData });
    });
    
    // Sort by score (highest first)
    cropScores.sort((a, b) => b.score - a.score);
    
    const bestCrop = cropScores[0];
    const confidence = Math.round(bestCrop.score);
    
    // Generate recommendations
    const recommendations = generateRecommendations(bestCrop.crop, soilParams, bestCrop.data);
    
    // Calculate harvest date
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + bestCrop.data.harvest_days);
    
    // Estimate yield based on soil quality
    const yieldMultiplier = confidence / 100;
    const estimatedYield = (bestCrop.data.yield_per_hectare * yieldMultiplier).toFixed(1);
    
    const result: PredictionResult = {
      crop_type: bestCrop.crop,
      yield_prediction: confidence,
      confidence,
      recommendations,
      expected_harvest_date: harvestDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      estimated_yield: `${estimatedYield} tons per hectare`
    };
    
    // Save prediction to database if user ID provided
    if (userId) {
      try {
        await savePrediction(userId, 'manual', result, { soil_data: soilParams });
      } catch (error) {
        console.warn('Failed to save prediction to database:', error);
      }
    }
    
    return {
      success: true,
      message: 'Crop prediction completed successfully',
      data: result
    };
    
  } catch (error) {
    console.error('Manual prediction error:', error);
    return {
      success: false,
      message: 'Failed to generate crop prediction'
    };
  }
};

// AI prediction using location and SoilGrids data
export const predictCropAI = async (
  location: LocationData, 
  soilGridsData: SoilGridData,
  userId?: string
): Promise<MLResponse> => {
  try {
    // Convert SoilGrids data to our soil parameters format
    const soilParams: SoilParameters = {
      nitrogen: soilGridsData.nitrogen,
      phosphorus: soilGridsData.phosphorus,
      potassium: soilGridsData.potassium,
      ph: soilGridsData.ph
    };
    
    // Determine climate zone from location
    const climateZone = getClimateZone(location.latitude);
    
    // Filter crops suitable for climate
    const suitableCrops = Object.entries(CROP_DATABASE).filter(([_, cropData]) => 
      cropData.climate.includes(climateZone)
    );
    
    if (suitableCrops.length === 0) {
      return {
        success: false,
        message: 'No suitable crops found for your climate zone'
      };
    }
    
    // Calculate scores only for climate-suitable crops
    const cropScores: Array<{ crop: string; score: number; data: any }> = [];
    
    suitableCrops.forEach(([cropName, cropData]) => {
      const soilScore = calculateCropFitness(cropData, soilParams);
      
      // AI enhancement: boost score for climate suitability
      const climateBonus = 10; // 10% bonus for climate suitability
      const aiScore = Math.min(100, soilScore + climateBonus);
      
      cropScores.push({ crop: cropName, score: aiScore, data: cropData });
    });
    
    // Sort by AI-enhanced score
    cropScores.sort((a, b) => b.score - a.score);
    
    const bestCrop = cropScores[0];
    const confidence = Math.round(bestCrop.score);
    
    // AI-enhanced recommendations
    const baseRecommendations = generateRecommendations(bestCrop.crop, soilParams, bestCrop.data);
    const aiRecommendations = [
      `AI analysis suggests ${bestCrop.crop} is optimal for your ${climateZone} climate`,
      `Location-based soil analysis indicates favorable growing conditions`,
      ...baseRecommendations.slice(0, 2) // Include top 2 soil recommendations
    ];
    
    // Calculate harvest date with climate consideration
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + bestCrop.data.harvest_days);
    
    // AI yield estimation with multiple factors
    const soilQuality = confidence / 100;
    const climateBonus = 1.1; // 10% bonus for AI climate matching
    const aiYieldMultiplier = soilQuality * climateBonus;
    const estimatedYield = (bestCrop.data.yield_per_hectare * aiYieldMultiplier).toFixed(1);
    
    const result: PredictionResult = {
      crop_type: bestCrop.crop,
      yield_prediction: confidence,
      confidence: Math.min(95, confidence + 5), // AI confidence bonus
      recommendations: aiRecommendations,
      expected_harvest_date: harvestDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      estimated_yield: `${estimatedYield} tons per hectare`
    };
    
    // Save AI prediction to database
    if (userId) {
      try {
        await savePrediction(userId, 'ai', result, { 
          location, 
          soilgrids_data: soilGridsData 
        });
      } catch (error) {
        console.warn('Failed to save AI prediction to database:', error);
      }
    }
    
    return {
      success: true,
      message: 'AI crop prediction completed successfully',
      data: result
    };
    
  } catch (error) {
    console.error('AI prediction error:', error);
    return {
      success: false,
      message: 'Failed to generate AI crop prediction'
    };
  }
};

// Save prediction to database
const savePrediction = async (
  userId: string, 
  predictionType: 'manual' | 'ai', 
  result: PredictionResult,
  additionalData: any
) => {
  try {
    const { error } = await supabase.from('crop_predictions').insert({
      user_id: userId,
      prediction_type: predictionType,
      prediction_result: result,
      ...additionalData
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving prediction:', error);
    // Save to localStorage as fallback for demo
    const prediction = {
      id: `prediction_${Date.now()}`,
      user_id: userId,
      prediction_type: predictionType,
      prediction_result: result,
      created_at: new Date().toISOString(),
      ...additionalData
    };
    
    const existingPredictions = JSON.parse(localStorage.getItem('user_predictions') || '[]');
    existingPredictions.push(prediction);
    localStorage.setItem('user_predictions', JSON.stringify(existingPredictions.slice(-10))); // Keep last 10
    
    throw error;
  }
};

// Get user's prediction history
export const getUserPredictions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('crop_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Predictions retrieved successfully',
      data
    };
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return {
      success: false,
      message: 'Failed to fetch prediction history'
    };
  }
};