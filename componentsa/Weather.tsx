import { useState, useEffect } from 'react';
import { Cloud, Droplets, Eye, Thermometer, Wind, Gauge, MapPin, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { getWeatherData, getWeatherByCity, WeatherData } from '../lib/services/weather';
import { getCurrentLocation } from '../lib/services/location';
import { useLanguage } from '../lib/context/LanguageContext';

interface WeatherProps {
  onBack?: () => void;
}

export function Weather({ onBack }: WeatherProps) {
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load weather data on component mount
  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  const loadCurrentLocationWeather = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Show location request message
      if (navigator.geolocation) {
        // Ask for permission first
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Use actual browser location
            const { latitude, longitude } = position.coords;
            const weatherResponse = await getWeatherData(latitude, longitude);
            
            if (weatherResponse.success && weatherResponse.data) {
              setWeatherData(weatherResponse.data);
              setLastUpdated(new Date());
            } else {
              setError(weatherResponse.message);
            }
          },
          async (error) => {
            console.log('Location access denied, using service location:', error);
            // Fallback to service-based location detection
            const locationResponse = await getCurrentLocation();
            
            if (locationResponse.success && locationResponse.data) {
              const weatherResponse = await getWeatherData(
                locationResponse.data.latitude,
                locationResponse.data.longitude
              );
              
              if (weatherResponse.success && weatherResponse.data) {
                setWeatherData(weatherResponse.data);
                setLastUpdated(new Date());
              } else {
                setError(weatherResponse.message);
              }
            } else {
              // Ultimate fallback to default location (Delhi)
              const weatherResponse = await getWeatherData(28.6139, 77.2090);
              if (weatherResponse.success && weatherResponse.data) {
                setWeatherData(weatherResponse.data);
                setLastUpdated(new Date());
              } else {
                setError('Failed to load weather data');
              }
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        // Browser doesn't support geolocation
        const locationResponse = await getCurrentLocation();
        
        if (locationResponse.success && locationResponse.data) {
          const weatherResponse = await getWeatherData(
            locationResponse.data.latitude,
            locationResponse.data.longitude
          );
          
          if (weatherResponse.success && weatherResponse.data) {
            setWeatherData(weatherResponse.data);
            setLastUpdated(new Date());
          } else {
            setError(weatherResponse.message);
          }
        } else {
          setError('Failed to load weather data');
        }
      }
    } catch (error) {
      setError('Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const weatherResponse = await getWeatherByCity(cityInput);
      
      if (weatherResponse.success && weatherResponse.data) {
        setWeatherData(weatherResponse.data);
        setLastUpdated(new Date());
        setCityInput('');
      } else {
        setError(weatherResponse.message);
      }
    } catch (error) {
      setError('Failed to search weather for the city');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (cityInput.trim()) {
      handleCitySearch();
    } else {
      loadCurrentLocationWeather();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      {onBack && (
        <header className="bg-white border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-blue-600"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('common.back')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Cloud className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">{t('weather.title')}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('weather.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('weather.subtitle')}
          </p>
        </div>

        {/* Location Permission Notice */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-700 mb-3">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{t('weather.locationAccess')}</span>
            </div>
            <p className="text-blue-600 text-sm mb-3">
              {t('weather.locationNotice')}
            </p>
            <Button
              onClick={loadCurrentLocationWeather}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t('market.useCurrentLocation')}
            </Button>
          </div>
        </div>

        {/* Location Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex gap-3">
            <Input
              placeholder={t('weather.searchCity')}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
              className="border-blue-200 focus:border-blue-500"
            />
            <Button
              onClick={handleCitySearch}
              disabled={isLoading || !cityInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('weather.search')}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">{t('weather.loadingWeather')}</span>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && !isLoading && (
          <div className="space-y-8">
            {/* Current Weather */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
              <CardHeader className="text-center">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-blue-800">
                    {t('weather.current')}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription className="flex items-center justify-center space-x-2 text-blue-600">
                  <MapPin className="w-4 h-4" />
                  <span>{weatherData.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Main Weather Info */}
                  <div className="text-center">
                    <div className="text-6xl mb-4">{weatherData.current.icon}</div>
                    <div className="text-5xl font-bold text-blue-800 mb-2">
                      {weatherData.current.temperature}°C
                    </div>
                    <p className="text-xl text-blue-600 capitalize mb-4">
                      {weatherData.current.condition}
                    </p>
                    {lastUpdated && (
                      <p className="text-sm text-blue-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Weather Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Droplets className="w-5 h-5" />
                        <span className="font-medium">{t('weather.humidity')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{weatherData.current.humidity}%</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Wind className="w-5 h-5" />
                        <span className="font-medium">{t('weather.windSpeed')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{weatherData.current.windSpeed} km/h</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Gauge className="w-5 h-5" />
                        <span className="font-medium">{t('weather.pressure')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{weatherData.current.pressure} hPa</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">{t('weather.visibility')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{weatherData.current.visibility} km</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Calendar className="w-6 h-6" />
                  <span>5-Day Forecast</span>
                </CardTitle>
                <CardDescription>Short-term weather outlook for immediate planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                      <div className="font-medium text-blue-800 mb-2">
                        {index === 0 ? 'Today' : day.day}
                      </div>
                      <div className="text-3xl mb-2">{day.icon}</div>
                      <div className="text-sm font-medium text-gray-800 mb-2">
                        {day.high}° / {day.low}°
                      </div>
                      <p className="text-xs text-blue-600 capitalize mb-3">
                        {day.condition}
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Humidity:</span>
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rain:</span>
                          <span>{day.precipitation}mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Forecast */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Calendar className="w-6 h-6" />
                  <span>30-Day Monthly Forecast</span>
                </CardTitle>
                <CardDescription>Extended weather outlook for seasonal farming planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3 max-h-96 overflow-y-auto">
                  {weatherData.monthly.map((day, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100 hover:bg-blue-100 transition-colors">
                      <div className="font-medium text-blue-800 mb-1 text-xs">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xl mb-1">{day.icon}</div>
                      <div className="text-xs font-medium text-gray-800 mb-1">
                        {day.high}°/{day.low}°
                      </div>
                      <div className="space-y-0.5 text-xs text-gray-600">
                        <div>{day.humidity}%</div>
                        <div>{day.precipitation}mm</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Scroll to view all 30 days • Data includes temperature, humidity, and precipitation forecasts
                </div>
              </CardContent>
            </Card>

            {/* Farming Insights */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Farming Insights</CardTitle>
                <CardDescription>Weather-based recommendations for your crops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-800 mb-3">Current Conditions</h4>
                    <div className="space-y-2">
                      {weatherData.current.temperature > 30 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          🌡️ High temperature - Increase irrigation frequency
                        </Badge>
                      )}
                      {weatherData.current.humidity > 80 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          💧 High humidity - Monitor for fungal diseases
                        </Badge>
                      )}
                      {weatherData.current.windSpeed > 20 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          💨 Strong winds - Protect young plants
                        </Badge>
                      )}
                      {weatherData.current.temperature < 15 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          ❄️ Cool weather - Consider frost protection
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-green-800 mb-3">Upcoming Weather</h4>
                    <div className="space-y-2">
                      {weatherData.forecast.some(day => day.precipitation > 5) && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          🌧️ Rain expected - Adjust irrigation schedule
                        </Badge>
                      )}
                      {weatherData.forecast.some(day => day.high > 35) && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          🔥 Heat wave coming - Prepare shade covers
                        </Badge>
                      )}
                      {weatherData.forecast.some(day => day.low < 10) && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          🥶 Cold nights ahead - Protect sensitive crops
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}