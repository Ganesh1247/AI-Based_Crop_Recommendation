export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    pressure: number;
    windSpeed: number;
    visibility: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    humidity: number;
    precipitation: number;
  }>;
  monthly: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    pressure: number;
  }>;
}

export interface WeatherResponse {
  success: boolean;
  message: string;
  data?: WeatherData;
}

// OpenWeatherMap API (free tier) and One Call API for monthly data
const WEATHER_API_KEY = import.meta.env?.VITE_WEATHER_API_KEY || 'demo-key';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// Fetch current weather and forecast
export const getWeatherData = async (latitude: number, longitude: number): Promise<WeatherResponse> => {
  try {
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        success: false,
        message: 'Invalid coordinates provided'
      };
    }

    // Try to fetch real weather data including monthly forecast
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`),
        fetch(`${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`)
      ]);

      if (currentResponse.ok && forecastResponse.ok) {
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Try to get monthly data from OneCall API
        let monthlyData = null;
        try {
          const monthlyResponse = await fetch(`${ONECALL_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&exclude=minutely,alerts`);
          if (monthlyResponse.ok) {
            monthlyData = await monthlyResponse.json();
          }
        } catch (monthlyError) {
          console.warn('Monthly weather data unavailable, generating extended forecast');
        }

        const weatherData = parseWeatherData(currentData, forecastData, monthlyData);
        return {
          success: true,
          message: 'Weather data retrieved successfully',
          data: weatherData
        };
      } else {
        throw new Error('Weather API request failed');
      }
    } catch (apiError) {
      console.info('Weather API unavailable, using mock data for demo');
      return getMockWeatherData(latitude, longitude);
    }

  } catch (error) {
    console.error('Weather data error:', error);
    return getMockWeatherData(latitude, longitude);
  }
};

// Parse OpenWeatherMap API response including monthly data
const parseWeatherData = (currentData: any, forecastData: any, monthlyData?: any): WeatherData => {
  // Process current weather
  const current = {
    temperature: Math.round(currentData.main.temp),
    condition: currentData.weather[0].description,
    humidity: currentData.main.humidity,
    pressure: currentData.main.pressure,
    windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
    visibility: Math.round(currentData.visibility / 1000), // Convert m to km
    icon: getWeatherIcon(currentData.weather[0].id)
  };

  // Process 5-day forecast (API returns 3-hour intervals)
  const dailyForecasts: { [key: string]: any } = {};
  
  forecastData.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!dailyForecasts[dateKey]) {
      dailyForecasts[dateKey] = {
        date: dateKey,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        temps: [],
        conditions: [],
        humidity: [],
        precipitation: 0
      };
    }
    
    dailyForecasts[dateKey].temps.push(item.main.temp);
    dailyForecasts[dateKey].conditions.push(item.weather[0]);
    dailyForecasts[dateKey].humidity.push(item.main.humidity);
    
    if (item.rain) {
      dailyForecasts[dateKey].precipitation += item.rain['3h'] || 0;
    }
  });

  // Convert to forecast array
  const forecast = Object.values(dailyForecasts).slice(0, 5).map((day: any) => ({
    date: day.date,
    day: day.day,
    high: Math.round(Math.max(...day.temps)),
    low: Math.round(Math.min(...day.temps)),
    condition: day.conditions[0].description,
    icon: getWeatherIcon(day.conditions[0].id),
    humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
    precipitation: Math.round(day.precipitation * 10) / 10
  }));

  // Generate monthly forecast (30 days)
  const monthly = [];
  
  if (monthlyData && monthlyData.daily) {
    // Use OneCall API daily data for better monthly forecast
    for (let i = 0; i < Math.min(30, monthlyData.daily.length); i++) {
      const day = monthlyData.daily[i];
      const date = new Date(day.dt * 1000);
      
      monthly.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(day.temp.max),
        low: Math.round(day.temp.min),
        condition: day.weather[0].description,
        icon: getWeatherIcon(day.weather[0].id),
        humidity: day.humidity,
        precipitation: day.rain ? day.rain['1h'] || 0 : 0,
        windSpeed: Math.round(day.wind_speed * 3.6),
        pressure: day.pressure
      });
    }
  } else {
    // Generate extended forecast based on 5-day data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Use patterns from 5-day forecast to extrapolate
      const baseIndex = i % 5;
      const baseForecast = forecast[Math.min(baseIndex, forecast.length - 1)];
      
      // Add some variation to make it realistic
      const tempVariation = (Math.random() - 0.5) * 6;
      const humidityVariation = (Math.random() - 0.5) * 20;
      
      monthly.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(baseForecast.high + tempVariation),
        low: Math.round(baseForecast.low + tempVariation - 3),
        condition: baseForecast.condition,
        icon: baseForecast.icon,
        humidity: Math.max(20, Math.min(95, baseForecast.humidity + humidityVariation)),
        precipitation: Math.round(Math.random() * 5 * 10) / 10,
        windSpeed: Math.round(10 + Math.random() * 15),
        pressure: Math.round(1000 + Math.random() * 50)
      });
    }
  }

  return {
    location: currentData.name || 'Current Location',
    current,
    forecast,
    monthly
  };
};

// Map OpenWeatherMap condition codes to icons
const getWeatherIcon = (conditionCode: number): string => {
  if (conditionCode >= 200 && conditionCode < 300) return '⛈️'; // Thunderstorm
  if (conditionCode >= 300 && conditionCode < 400) return '🌦️'; // Drizzle
  if (conditionCode >= 500 && conditionCode < 600) return '🌧️'; // Rain
  if (conditionCode >= 600 && conditionCode < 700) return '❄️'; // Snow
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️'; // Atmosphere
  if (conditionCode === 800) return '☀️'; // Clear
  if (conditionCode > 800) return '☁️'; // Clouds
  return '🌤️'; // Default
};

// Generate mock weather data for demo purposes
const getMockWeatherData = (latitude: number, longitude: number): WeatherResponse => {
  // Generate realistic mock data based on geographic region
  const isNorthern = latitude > 30;
  const isTropical = Math.abs(latitude) < 23.5;
  const isWinter = new Date().getMonth() >= 10 || new Date().getMonth() <= 2;

  let baseTemp = 25; // Default temperature
  
  if (isTropical) {
    baseTemp = isWinter ? 28 : 32;
  } else if (isNorthern) {
    baseTemp = isWinter ? 8 : 22;
  } else {
    baseTemp = isWinter ? 15 : 28;
  }

  // Add some randomization
  const currentTemp = Math.round(baseTemp + (Math.random() - 0.5) * 10);
  
  const conditions = isTropical 
    ? ['Partly cloudy', 'Thunderstorms', 'Heavy rain', 'Sunny']
    : isWinter 
    ? ['Cloudy', 'Light rain', 'Overcast', 'Clear']
    : ['Sunny', 'Partly cloudy', 'Clear', 'Light breeze'];
  
  const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];

  const mockData: WeatherData = {
    location: `Location ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    current: {
      temperature: currentTemp,
      condition: currentCondition,
      humidity: Math.round(50 + Math.random() * 40), // 50-90%
      pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
      windSpeed: Math.round(5 + Math.random() * 20), // 5-25 km/h
      visibility: Math.round(8 + Math.random() * 7), // 8-15 km
      icon: getWeatherIconFromCondition(currentCondition)
    },
    forecast: [],
    monthly: []
  };

  // Generate 5-day forecast
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const dayTemp = currentTemp + (Math.random() - 0.5) * 8;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    mockData.forecast.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      high: Math.round(dayTemp + 3),
      low: Math.round(dayTemp - 5),
      condition,
      icon: getWeatherIconFromCondition(condition),
      humidity: Math.round(45 + Math.random() * 35),
      precipitation: Math.round(Math.random() * 5 * 10) / 10
    });
  }

  // Generate 30-day monthly forecast
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const dayTemp = currentTemp + (Math.random() - 0.5) * 12;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    mockData.monthly.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      high: Math.round(dayTemp + 4),
      low: Math.round(dayTemp - 6),
      condition,
      icon: getWeatherIconFromCondition(condition),
      humidity: Math.round(40 + Math.random() * 40),
      precipitation: Math.round(Math.random() * 8 * 10) / 10,
      windSpeed: Math.round(5 + Math.random() * 25),
      pressure: Math.round(995 + Math.random() * 60)
    });
  }

  return {
    success: true,
    message: 'Mock weather data generated (API unavailable)',
    data: mockData
  };
};

// Map condition text to weather icons
const getWeatherIconFromCondition = (condition: string): string => {
  const lower = condition.toLowerCase();
  if (lower.includes('thunder')) return '⛈️';
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  return '🌤️';
};

// Get weather by city name
export const getWeatherByCity = async (cityName: string): Promise<WeatherResponse> => {
  try {
    const geocodeResponse = await fetch(
      `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (geocodeResponse.ok) {
      const data = await geocodeResponse.json();
      return getWeatherData(data.coord.lat, data.coord.lon);
    } else {
      throw new Error('City not found');
    }
  } catch (error) {
    // Return mock data for demo
    return getMockWeatherData(28.6139, 77.2090); // Delhi coordinates as fallback
  }
};