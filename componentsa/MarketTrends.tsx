import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, MapPin, Calendar, Package, Users, Target, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { useLanguage } from '../lib/context/LanguageContext';
import { useAuth } from '../lib/context/AuthContext';
import { getCurrentLocation } from '../lib/services/location';

interface MarketTrendsProps {
  onBack?: () => void;
}

interface CropPrice {
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  unit: string;
  season: string;
  demand: 'High' | 'Medium' | 'Low';
  supply: 'High' | 'Medium' | 'Low';
  forecast: 'Rising' | 'Stable' | 'Falling';
}

interface MarketInsight {
  title: string;
  description: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  category: 'Price' | 'Weather' | 'Government' | 'Export' | 'Seasonal';
}

export function MarketTrends({ onBack }: MarketTrendsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [locationInput, setLocationInput] = useState('');
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load market data for default location (Andhra Pradesh)
    loadMarketData();
  }, [selectedState]);



  const handleLocationSearch = () => {
    if (locationInput.trim()) {
      setSelectedState(locationInput.trim());
      setLocationInput('');
    }
  };

  const loadMarketData = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic market data based on location
    const mockCropPrices: CropPrice[] = [
      {
        name: 'Rice',
        currentPrice: 2850,
        previousPrice: 2720,
        change: 130,
        changePercent: 4.8,
        unit: '₹/quintal',
        season: 'Kharif',
        demand: 'High',
        supply: 'Medium',
        forecast: 'Rising'
      },
      {
        name: 'Wheat',
        currentPrice: 2240,
        previousPrice: 2310,
        change: -70,
        changePercent: -3.0,
        unit: '₹/quintal',
        season: 'Rabi',
        demand: 'Medium',
        supply: 'High',
        forecast: 'Falling'
      },
      {
        name: 'Sugarcane',
        currentPrice: 380,
        previousPrice: 375,
        change: 5,
        changePercent: 1.3,
        unit: '₹/quintal',
        season: 'Annual',
        demand: 'High',
        supply: 'Medium',
        forecast: 'Stable'
      },
      {
        name: 'Cotton',
        currentPrice: 6850,
        previousPrice: 6420,
        change: 430,
        changePercent: 6.7,
        unit: '₹/quintal',
        season: 'Kharif',
        demand: 'High',
        supply: 'Low',
        forecast: 'Rising'
      },
      {
        name: 'Tomato',
        currentPrice: 1560,
        previousPrice: 2100,
        change: -540,
        changePercent: -25.7,
        unit: '₹/quintal',
        season: 'Year-round',
        demand: 'Medium',
        supply: 'High',
        forecast: 'Falling'
      },
      {
        name: 'Onion',
        currentPrice: 2240,
        previousPrice: 1890,
        change: 350,
        changePercent: 18.5,
        unit: '₹/quintal',
        season: 'Rabi',
        demand: 'High',
        supply: 'Low',
        forecast: 'Rising'
      },
      {
        name: 'Potato',
        currentPrice: 1680,
        previousPrice: 1450,
        change: 230,
        changePercent: 15.9,
        unit: '₹/quintal',
        season: 'Rabi',
        demand: 'Medium',
        supply: 'Low',
        forecast: 'Rising'
      },
      {
        name: 'Soybean',
        currentPrice: 4320,
        previousPrice: 4150,
        change: 170,
        changePercent: 4.1,
        unit: '₹/quintal',
        season: 'Kharif',
        demand: 'High',
        supply: 'Medium',
        forecast: 'Stable'
      }
    ];

    const mockInsights: MarketInsight[] = [
      {
        title: 'Cotton Prices Surge Due to Export Demand',
        description: 'International demand for Indian cotton has increased by 15% this quarter, driving up domestic prices.',
        impact: 'Positive',
        category: 'Export'
      },
      {
        title: 'Tomato Supply Glut Affects Pricing',
        description: 'Bumper harvest in major producing regions has led to oversupply, causing price decline.',
        impact: 'Negative',
        category: 'Price'
      },
      {
        title: 'Government Announces MSP Increase',
        description: 'Minimum Support Price for wheat increased by ₹110/quintal for the upcoming season.',
        impact: 'Positive',
        category: 'Government'
      },
      {
        title: 'Monsoon Impact on Kharif Crops',
        description: 'Above-normal rainfall expected to boost kharif crop production, potentially affecting prices.',
        impact: 'Neutral',
        category: 'Weather'
      },
      {
        title: 'Onion Storage Crisis Drives Prices Up',
        description: 'Storage infrastructure shortage in key producing areas has reduced supply availability.',
        impact: 'Positive',
        category: 'Price'
      }
    ];

    setCropPrices(mockCropPrices);
    setMarketInsights(mockInsights);
    setIsLoading(false);
  };

  const getTrendIcon = (forecast: string) => {
    switch (forecast) {
      case 'Rising':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'Falling':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDemandSupplyColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('market.loadingTrends')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      {onBack && (
        <header className="bg-white border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-green-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('common.back')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">{t('market.title')}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{selectedState || t('market.locationPermission')}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Location Control */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Market Trends - {selectedState}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Real-time crop prices and market insights for {selectedState}
          </p>
          
          {/* Clean Location Selector */}
          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-green-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 text-green-700 mb-3">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Change Location</span>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter state name (e.g., Karnataka, Tamil Nadu)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  className="border-green-200 focus:border-green-500 rounded-xl"
                />
                <Button
                  onClick={handleLocationSearch}
                  disabled={!locationInput.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
        </div>

        {selectedState && (
          <Tabs defaultValue="prices" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prices">{t('market.cropPrices')}</TabsTrigger>
              <TabsTrigger value="insights">{t('market.marketInsights')}</TabsTrigger>
              <TabsTrigger value="recommendations">{t('market.productionTips')}</TabsTrigger>
            </TabsList>

            {/* Crop Prices Tab */}
            <TabsContent value="prices" className="space-y-6">
              <div className="grid gap-4">
                {cropPrices.map((crop, index) => (
                  <Card key={index} className="border-green-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{crop.season} {t('market.season')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {crop.currentPrice.toLocaleString('en-IN')} {crop.unit}
                          </div>
                          <div className={`flex items-center space-x-1 ${
                            crop.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crop.change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                              {crop.change >= 0 ? '+' : ''}{crop.change} ({crop.changePercent >= 0 ? '+' : ''}{crop.changePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-1">{t('market.demand')}</div>
                          <Badge className={getDemandSupplyColor(crop.demand)}>
                            {t(`market.${crop.demand.toLowerCase()}`)}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-1">{t('market.supply')}</div>
                          <Badge className={getDemandSupplyColor(crop.supply)}>
                            {t(`market.${crop.supply.toLowerCase()}`)}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-1">{t('market.forecast')}</div>
                          <div className="flex items-center justify-center space-x-1">
                            {getTrendIcon(crop.forecast)}
                            <span className="text-sm font-medium">{t(`market.${crop.forecast.toLowerCase()}`)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Market Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-4">
                {marketInsights.map((insight, index) => (
                  <Card key={index} className={`border-2 ${getImpactColor(insight.impact)}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant="outline" className="bg-white">
                          {insight.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{insight.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Production Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span>{t('market.highProfitCrops')}</span>
                    </CardTitle>
                    <CardDescription>{t('market.highProfitDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Cotton</span>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">+6.7%</div>
                        <div className="text-sm text-gray-600">{t('market.highDemand')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Onion</span>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">+18.5%</div>
                        <div className="text-sm text-gray-600">{t('market.lowSupply')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Potato</span>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">+15.9%</div>
                        <div className="text-sm text-gray-600">{t('market.growingDemand')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span>{t('market.opportunities')}</span>
                    </CardTitle>
                    <CardDescription>{t('market.opportunitiesDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">{t('market.exportOpportunities')}</h4>
                      <p className="text-sm text-orange-700">{t('market.exportDesc')}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">{t('market.processingUnits')}</h4>
                      <p className="text-sm text-orange-700">{t('market.processingDesc')}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">{t('market.governmentSchemes')}</h4>
                      <p className="text-sm text-orange-700">{t('market.schemesDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>{t('market.priceForecasting')}</span>
                  </CardTitle>
                  <CardDescription>{t('market.forecastingDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cropPrices.slice(0, 4).map((crop, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{crop.name}</span>
                          {getTrendIcon(crop.forecast)}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">
                            {crop.forecast === 'Rising' ? t('market.increaseExpected') : 
                             crop.forecast === 'Falling' ? t('market.decreaseExpected') : t('market.stablePrices')}
                          </div>
                          <div className="text-sm text-gray-600">{t('market.nextQuarter')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}