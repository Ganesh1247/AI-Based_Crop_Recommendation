import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, TestTube, BarChart3, Leaf, RefreshCw, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../lib/context/LanguageContext';

interface SoilAnalysisProps {
  onBack?: () => void;
}

interface SoilData {
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
  salinity: number;
  temperature: number;
}

interface SoilAnalysisResult {
  overall_score: number;
  recommendations: string[];
  suitable_crops: string[];
  ph_status: string;
  nutrient_levels: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}

export function SoilAnalysis({ onBack }: SoilAnalysisProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('test');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [soilData, setSoilData] = useState<SoilData>({
    pH: 6.5,
    nitrogen: 25,
    phosphorus: 15,
    potassium: 180,
    organicMatter: 3.2,
    moisture: 22,
    salinity: 0.8,
    temperature: 24
  });
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null);

  useEffect(() => {
    // Auto-analyze with default data
    handleAnalyze();
  }, []);

  const handleInputChange = (field: keyof SoilData, value: string) => {
    setSoilData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic analysis based on input data
    const result = generateSoilAnalysis(soilData);
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const generateSoilAnalysis = (data: SoilData): SoilAnalysisResult => {
    let overall_score = 70; // Base score
    const recommendations: string[] = [];
    const suitable_crops: string[] = [];

    // pH Analysis
    let ph_status = 'Optimal';
    if (data.pH < 6.0) {
      ph_status = 'Acidic';
      recommendations.push('Add lime to increase soil pH');
      overall_score -= 10;
    } else if (data.pH > 7.5) {
      ph_status = 'Alkaline';
      recommendations.push('Add sulfur to decrease soil pH');
      overall_score -= 8;
    } else {
      overall_score += 5;
    }

    // Nitrogen Analysis
    let nitrogen_status = 'Good';
    if (data.nitrogen < 20) {
      nitrogen_status = 'Low';
      recommendations.push('Apply nitrogen-rich fertilizer');
      overall_score -= 15;
    } else if (data.nitrogen > 40) {
      nitrogen_status = 'High';
      recommendations.push('Reduce nitrogen application');
      overall_score -= 5;
    } else {
      overall_score += 8;
    }

    // Phosphorus Analysis
    let phosphorus_status = 'Good';
    if (data.phosphorus < 10) {
      phosphorus_status = 'Low';
      recommendations.push('Add phosphorus fertilizer');
      overall_score -= 12;
    } else if (data.phosphorus > 25) {
      phosphorus_status = 'High';
      overall_score += 3;
    } else {
      overall_score += 5;
    }

    // Potassium Analysis
    let potassium_status = 'Good';
    if (data.potassium < 150) {
      potassium_status = 'Low';
      recommendations.push('Apply potassium-rich fertilizer');
      overall_score -= 10;
    } else if (data.potassium > 250) {
      potassium_status = 'High';
      overall_score += 3;
    } else {
      overall_score += 5;
    }

    // Organic Matter Analysis
    if (data.organicMatter < 2.0) {
      recommendations.push('Increase organic matter with compost');
      overall_score -= 8;
    } else if (data.organicMatter > 4.0) {
      overall_score += 8;
    }

    // Moisture Analysis
    if (data.moisture < 15) {
      recommendations.push('Improve water retention');
    } else if (data.moisture > 35) {
      recommendations.push('Improve drainage');
    }

    // Recommend suitable crops based on conditions
    if (data.pH >= 6.0 && data.pH <= 7.0) {
      suitable_crops.push('Rice', 'Wheat', 'Corn');
    }
    if (nitrogen_status === 'Good' || nitrogen_status === 'High') {
      suitable_crops.push('Leafy Vegetables', 'Sugarcane');
    }
    if (phosphorus_status === 'Good' || phosphorus_status === 'High') {
      suitable_crops.push('Legumes', 'Root Vegetables');
    }
    if (potassium_status === 'Good' || potassium_status === 'High') {
      suitable_crops.push('Fruits', 'Potatoes');
    }

    // Ensure score is within bounds
    overall_score = Math.max(0, Math.min(100, overall_score));

    return {
      overall_score,
      recommendations: recommendations.length > 0 ? recommendations : ['Your soil is in good condition'],
      suitable_crops: Array.from(new Set(suitable_crops)), // Remove duplicates
      ph_status,
      nutrient_levels: {
        nitrogen: nitrogen_status,
        phosphorus: phosphorus_status,
        potassium: potassium_status
      }
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Good' || status === 'Optimal') return 'bg-green-100 text-green-800';
    if (status === 'High') return 'bg-blue-100 text-blue-800';
    if (status === 'Low' || status === 'Acidic' || status === 'Alkaline') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

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
                <TestTube className="w-8 h-8 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">{t('features.soil.title')}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('features.soil.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('features.soil.desc')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test">Soil Testing</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Soil Testing Tab */}
          <TabsContent value="test" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Location Input */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="location">Field Location</Label>
                      <Input
                        id="location"
                        placeholder="Enter your field location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Soil Sample Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Soil Parameters */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TestTube className="w-5 h-5 text-green-600" />
                    <span>Soil Parameters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ph">pH Level</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        value={soilData.pH}
                        onChange={(e) => handleInputChange('pH', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nitrogen">Nitrogen (ppm)</Label>
                      <Input
                        id="nitrogen"
                        type="number"
                        value={soilData.nitrogen}
                        onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phosphorus">Phosphorus (ppm)</Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        value={soilData.phosphorus}
                        onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="potassium">Potassium (ppm)</Label>
                      <Input
                        id="potassium"
                        type="number"
                        value={soilData.potassium}
                        onChange={(e) => handleInputChange('potassium', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organicMatter">Organic Matter (%)</Label>
                      <Input
                        id="organicMatter"
                        type="number"
                        step="0.1"
                        value={soilData.organicMatter}
                        onChange={(e) => handleInputChange('organicMatter', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moisture">Moisture (%)</Label>
                      <Input
                        id="moisture"
                        type="number"
                        value={soilData.moisture}
                        onChange={(e) => handleInputChange('moisture', e.target.value)}
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Soil...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Analyze Soil
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Analysis Results Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {analysisResult && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Overall Score */}
                <Card className="border-green-200">
                  <CardHeader className="text-center">
                    <CardTitle>Soil Health Score</CardTitle>
                    <CardDescription>Overall assessment of your soil condition</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold mb-4 ${getScoreColor(analysisResult.overall_score)}`}>
                      {analysisResult.overall_score}
                    </div>
                    <Progress 
                      value={analysisResult.overall_score} 
                      className="w-full mb-4"
                    />
                    <p className="text-gray-600">
                      Your soil health is{' '}
                      {analysisResult.overall_score >= 80 ? 'Excellent' : 
                       analysisResult.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </CardContent>
                </Card>

                {/* Nutrient Analysis */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Nutrient Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of soil nutrients</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">pH Level</span>
                      <Badge className={getStatusColor(analysisResult.ph_status)}>
                        {analysisResult.ph_status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nitrogen</span>
                      <Badge className={getStatusColor(analysisResult.nutrient_levels.nitrogen)}>
                        {analysisResult.nutrient_levels.nitrogen}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Phosphorus</span>
                      <Badge className={getStatusColor(analysisResult.nutrient_levels.phosphorus)}>
                        {analysisResult.nutrient_levels.phosphorus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Potassium</span>
                      <Badge className={getStatusColor(analysisResult.nutrient_levels.potassium)}>
                        {analysisResult.nutrient_levels.potassium}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Suitable Crops */}
                <Card className="border-green-200 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span>Recommended Crops</span>
                    </CardTitle>
                    <CardDescription>Crops suitable for your soil conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.suitable_crops.map((crop, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {analysisResult && (
              <div className="grid gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Improvement Recommendations</CardTitle>
                    <CardDescription>Actionable steps to improve your soil health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 flex-1">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-center">
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Leaf className="w-4 h-4 mr-2" />
                    Get Fertilizer Recommendations
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}