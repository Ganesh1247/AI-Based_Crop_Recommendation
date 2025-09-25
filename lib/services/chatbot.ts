export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  data?: {
    response: string;
    suggestions?: string[];
  };
}

// Agricultural knowledge base for the chatbot
const AGRICULTURE_KNOWLEDGE = {
  crops: {
    rice: {
      plantingSeason: 'Monsoon (June-July)',
      harvestTime: '3-4 months',
      soilType: 'Clay loam, well-drained',
      waterRequirement: 'High (flooded fields)',
      fertilizer: 'NPK 20:10:10',
      commonDiseases: ['Blast', 'Brown spot', 'Bacterial leaf blight'],
      tips: ['Maintain 2-3 inch water level', 'Transplant 20-25 day old seedlings']
    },
    wheat: {
      plantingSeason: 'Winter (November-December)',
      harvestTime: '4-5 months',
      soilType: 'Well-drained loamy soil',
      waterRequirement: 'Moderate',
      fertilizer: 'NPK 12:32:16',
      commonDiseases: ['Rust', 'Bunt', 'Smut'],
      tips: ['Sow at 2-3 cm depth', 'Apply nitrogen in split doses']
    },
    corn: {
      plantingSeason: 'Summer (March-July)',
      harvestTime: '3-4 months',
      soilType: 'Well-drained fertile soil',
      waterRequirement: 'Moderate to high',
      fertilizer: 'NPK 18:46:0',
      commonDiseases: ['Corn borer', 'Leaf blight', 'Rust'],
      tips: ['Plant after last frost', 'Ensure good drainage']
    },
    sugarcane: {
      plantingSeason: 'February-April, October-November',
      harvestTime: '12-18 months',
      soilType: 'Deep, well-drained fertile soil',
      waterRequirement: 'High',
      fertilizer: 'NPK 10:26:26',
      commonDiseases: ['Red rot', 'Smut', 'Wilt'],
      tips: ['Plant healthy setts', 'Maintain soil moisture']
    }
  },
  
  soilManagement: {
    testing: 'Test soil pH, NPK levels, and organic matter content annually',
    improvement: 'Add organic compost, practice crop rotation, use cover crops',
    ph: 'Most crops prefer pH 6.0-7.5. Use lime to increase pH, sulfur to decrease',
    drainage: 'Ensure proper drainage to prevent waterlogging and root diseases'
  },
  
  irrigation: {
    drip: 'Efficient water use, reduces disease, suitable for row crops',
    sprinkler: 'Good for large areas, uniform water distribution',
    furrow: 'Traditional method, suitable for crops like sugarcane and cotton',
    timing: 'Water early morning or evening to reduce evaporation losses'
  },
  
  fertilizers: {
    nitrogen: 'Promotes leafy growth, essential for cereals',
    phosphorus: 'Root development and flowering, important for legumes',
    potassium: 'Disease resistance and fruit quality',
    organic: 'Compost, manure improve soil structure and microbial activity'
  },
  
  pestManagement: {
    ipm: 'Integrated Pest Management - combine biological, cultural, and chemical methods',
    biologicalControl: 'Use beneficial insects, neem oil, bacterial pesticides',
    prevention: 'Crop rotation, resistant varieties, proper sanitation',
    monitoring: 'Regular field inspection, pest traps, weather monitoring'
  }
};

// Pre-defined responses for common questions
const COMMON_RESPONSES = {
  greeting: [
    "Hello! I'm here to help with all your agricultural questions. What would you like to know?",
    "Hi there! I'm your farming assistant. How can I help you grow better crops today?",
    "Welcome! I have knowledge about crops, soil management, irrigation, and pest control. What interests you?"
  ],
  
  cropAdvice: [
    "I can provide detailed information about rice, wheat, corn, sugarcane, and many other crops. Which crop are you interested in?",
    "For crop-specific advice, please tell me which crop you're planning to grow or currently growing.",
    "I have comprehensive data on planting seasons, soil requirements, and care tips for various crops."
  ],
  
  soilQuestions: [
    "Soil health is crucial for good harvests. I can help with soil testing, pH management, and fertilization strategies.",
    "Good soil management includes regular testing, organic matter addition, and proper drainage. What specific aspect interests you?",
    "Healthy soil = healthy crops. Let me know if you need help with soil testing, amendments, or improvement techniques."
  ],
  
  weatherConcerns: [
    "Weather planning is essential for farming success. I can help you understand how weather affects your crops and planning strategies.",
    "Different crops have different weather requirements. Which crop and weather aspect would you like to discuss?",
    "Weather challenges like drought, excessive rain, or temperature extremes require specific management strategies."
  ],
  
  fallback: [
    "I'd be happy to help with that! Could you provide more specific details about your farming question?",
    "That's an interesting question! For the best advice, could you tell me more about your specific situation?",
    "I want to give you the most accurate information. Could you elaborate on what you'd like to know?"
  ]
};

// Analyze user query and generate appropriate response
export const getChatbotResponse = async (userMessage: string): Promise<ChatbotResponse> => {
  try {
    const message = userMessage.toLowerCase().trim();
    
    // Handle greetings
    if (isGreeting(message)) {
      return {
        success: true,
        message: 'Response generated',
        data: {
          response: getRandomResponse(COMMON_RESPONSES.greeting),
          suggestions: [
            "Tell me about rice cultivation",
            "How to improve soil health?",
            "Best irrigation methods",
            "Pest management tips"
          ]
        }
      };
    }
    
    // Handle crop-specific questions
    const cropInfo = extractCropInfo(message);
    if (cropInfo) {
      return {
        success: true,
        message: 'Crop information provided',
        data: {
          response: generateCropResponse(cropInfo, message),
          suggestions: [
            `${cropInfo.name} planting season`,
            `${cropInfo.name} fertilizer requirements`,
            `${cropInfo.name} common diseases`,
            `${cropInfo.name} irrigation needs`
          ]
        }
      };
    }
    
    // Handle soil management questions
    if (isSoilQuestion(message)) {
      return {
        success: true,
        message: 'Soil management advice provided',
        data: {
          response: generateSoilResponse(message),
          suggestions: [
            "Soil pH management",
            "Organic matter improvement",
            "Soil testing procedures",
            "Drainage solutions"
          ]
        }
      };
    }
    
    // Handle irrigation questions
    if (isIrrigationQuestion(message)) {
      return {
        success: true,
        message: 'Irrigation advice provided',
        data: {
          response: generateIrrigationResponse(message),
          suggestions: [
            "Drip irrigation benefits",
            "Water conservation methods",
            "Irrigation scheduling",
            "Water quality testing"
          ]
        }
      };
    }
    
    // Handle pest and disease questions
    if (isPestQuestion(message)) {
      return {
        success: true,
        message: 'Pest management advice provided',
        data: {
          response: generatePestResponse(message),
          suggestions: [
            "Organic pest control",
            "Beneficial insects",
            "Disease prevention",
            "IPM strategies"
          ]
        }
      };
    }
    
    // Handle fertilizer questions
    if (isFertilizerQuestion(message)) {
      return {
        success: true,
        message: 'Fertilizer advice provided',
        data: {
          response: generateFertilizerResponse(message),
          suggestions: [
            "NPK ratios explained",
            "Organic fertilizers",
            "Application timing",
            "Soil nutrient testing"
          ]
        }
      };
    }
    
    // Fallback response
    return {
      success: true,
      message: 'General response provided',
      data: {
        response: getRandomResponse(COMMON_RESPONSES.fallback),
        suggestions: [
          "Crop selection advice",
          "Soil management tips",
          "Irrigation guidance",
          "Pest control methods"
        ]
      }
    };
    
  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      success: false,
      message: 'Failed to generate response'
    };
  }
};

// Helper functions
const isGreeting = (message: string): boolean => {
  const greetings = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'start', 'help'];
  return greetings.some(greeting => message.includes(greeting));
};

const extractCropInfo = (message: string) => {
  const crops = Object.keys(AGRICULTURE_KNOWLEDGE.crops);
  for (const crop of crops) {
    if (message.includes(crop)) {
      return {
        name: crop,
        data: AGRICULTURE_KNOWLEDGE.crops[crop as keyof typeof AGRICULTURE_KNOWLEDGE.crops]
      };
    }
  }
  return null;
};

const isSoilQuestion = (message: string): boolean => {
  const soilKeywords = ['soil', 'ph', 'fertilizer', 'nutrient', 'compost', 'manure', 'testing'];
  return soilKeywords.some(keyword => message.includes(keyword));
};

const isIrrigationQuestion = (message: string): boolean => {
  const irrigationKeywords = ['water', 'irrigation', 'drip', 'sprinkler', 'watering', 'drought'];
  return irrigationKeywords.some(keyword => message.includes(keyword));
};

const isPestQuestion = (message: string): boolean => {
  const pestKeywords = ['pest', 'disease', 'insect', 'bug', 'fungus', 'control', 'spray'];
  return pestKeywords.some(keyword => message.includes(keyword));
};

const isFertilizerQuestion = (message: string): boolean => {
  const fertilizerKeywords = ['fertilizer', 'npk', 'nitrogen', 'phosphorus', 'potassium', 'nutrients'];
  return fertilizerKeywords.some(keyword => message.includes(keyword));
};

const generateCropResponse = (cropInfo: any, message: string): string => {
  const crop = cropInfo.data;
  const cropName = cropInfo.name.charAt(0).toUpperCase() + cropInfo.name.slice(1);
  
  if (message.includes('season') || message.includes('plant') || message.includes('sow')) {
    return `${cropName} is best planted during ${crop.plantingSeason}. ${crop.tips[0]}. The crop typically takes ${crop.harvestTime} to mature.`;
  }
  
  if (message.includes('soil')) {
    return `${cropName} grows best in ${crop.soilType}. Make sure to maintain proper drainage and consider the water requirement of ${crop.waterRequirement.toLowerCase()}.`;
  }
  
  if (message.includes('fertilizer') || message.includes('nutrient')) {
    return `For ${cropName}, use ${crop.fertilizer} fertilizer. ${crop.tips[1] || 'Apply fertilizers based on soil test recommendations.'}`; 
  }
  
  if (message.includes('disease') || message.includes('pest')) {
    return `Common diseases affecting ${cropName} include: ${crop.commonDiseases.join(', ')}. Practice preventive measures like crop rotation and use disease-resistant varieties.`;
  }
  
  // General crop information
  return `${cropName} Information:\n• Planting Season: ${crop.plantingSeason}\n• Harvest Time: ${crop.harvestTime}\n• Soil Type: ${crop.soilType}\n• Water Requirement: ${crop.waterRequirement}\n• Recommended Fertilizer: ${crop.fertilizer}\n\nTip: ${crop.tips[0]}`;
};

const generateSoilResponse = (message: string): string => {
  if (message.includes('ph')) {
    return `${AGRICULTURE_KNOWLEDGE.soilManagement.ph}. Regular soil testing helps maintain optimal pH levels for your crops.`;
  }
  
  if (message.includes('test')) {
    return `${AGRICULTURE_KNOWLEDGE.soilManagement.testing}. This helps you understand what nutrients your soil needs.`;
  }
  
  if (message.includes('improve') || message.includes('health')) {
    return `${AGRICULTURE_KNOWLEDGE.soilManagement.improvement}. These practices enhance soil structure and fertility naturally.`;
  }
  
  if (message.includes('drainage')) {
    return `${AGRICULTURE_KNOWLEDGE.soilManagement.drainage}. Poor drainage can lead to root rot and reduced crop yields.`;
  }
  
  return `Soil management is crucial for successful farming. Key practices include: regular testing, maintaining proper pH (6.0-7.5), adding organic matter, and ensuring good drainage. Would you like specific advice on any of these aspects?`;
};

const generateIrrigationResponse = (message: string): string => {
  if (message.includes('drip')) {
    return `Drip irrigation: ${AGRICULTURE_KNOWLEDGE.irrigation.drip}. It's particularly effective for vegetables and fruit crops.`;
  }
  
  if (message.includes('sprinkler')) {
    return `Sprinkler irrigation: ${AGRICULTURE_KNOWLEDGE.irrigation.sprinkler}. Best for cereals and fodder crops.`;
  }
  
  if (message.includes('timing') || message.includes('when')) {
    return `Irrigation timing: ${AGRICULTURE_KNOWLEDGE.irrigation.timing}. Monitor soil moisture and weather conditions for optimal scheduling.`;
  }
  
  return `Choose the right irrigation method based on your crop, soil type, and water availability. Drip irrigation is most efficient, while sprinkler systems work well for large areas. Always consider water conservation techniques.`;
};

const generatePestResponse = (message: string): string => {
  if (message.includes('organic') || message.includes('natural')) {
    return `Organic pest control: ${AGRICULTURE_KNOWLEDGE.pestManagement.biologicalControl}. These methods are environmentally friendly and sustainable.`;
  }
  
  if (message.includes('ipm') || message.includes('integrated')) {
    return `IPM approach: ${AGRICULTURE_KNOWLEDGE.pestManagement.ipm}. This reduces pesticide use while maintaining effective control.`;
  }
  
  if (message.includes('prevent')) {
    return `Prevention strategies: ${AGRICULTURE_KNOWLEDGE.pestManagement.prevention}. Prevention is always better than treatment.`;
  }
  
  return `Effective pest management combines prevention, monitoring, and targeted treatment. Use IPM strategies that include biological controls, resistant varieties, and only use chemicals when necessary. Regular field monitoring is key to early detection.`;
};

const generateFertilizerResponse = (message: string): string => {
  if (message.includes('nitrogen')) {
    return `Nitrogen: ${AGRICULTURE_KNOWLEDGE.fertilizers.nitrogen}. Signs of deficiency include yellowing of older leaves.`;
  }
  
  if (message.includes('phosphorus')) {
    return `Phosphorus: ${AGRICULTURE_KNOWLEDGE.fertilizers.phosphorus}. Deficiency shows as purple or reddish leaf discoloration.`;
  }
  
  if (message.includes('potassium')) {
    return `Potassium: ${AGRICULTURE_KNOWLEDGE.fertilizers.potassium}. Deficiency appears as brown leaf margins and weak stems.`;
  }
  
  if (message.includes('organic')) {
    return `Organic fertilizers: ${AGRICULTURE_KNOWLEDGE.fertilizers.organic}. They provide slow-release nutrients and improve soil health.`;
  }
  
  return `Balanced fertilization is essential for healthy crops. The three main nutrients are N (nitrogen) for growth, P (phosphorus) for roots and flowers, and K (potassium) for disease resistance. Soil testing helps determine the right NPK ratio for your crops.`;
};

const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)];
};