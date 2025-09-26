import { useState } from "react";
import { ArrowLeft, Brain, Edit3, Leaf, Zap, TrendingUp, Droplets, Beaker, MapPin, Satellite, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getCurrentLocation, searchLocation } from "../lib/services/location";
import { getSoilData } from "../lib/services/soilgrid";
import { predictCropManual, predictCropAI, CROP_DATABASE } from "../lib/services/ml-model";
import type { LocationData } from "../lib/services/location";
import type { SoilGridData } from "../lib/services/soilgrid";
import type { PredictionResult } from "../lib/services/ml-model";

interface CropPredictProps {
  onBack: () => void;
}

export function CropPredict({ onBack }: CropPredictProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  
  const [manualData, setManualData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: ""
  });

  const [aiData, setAiData] = useState({
    location: null as LocationData | null,
    soilGridsData: null as SoilGridData | null,
    locationInput: ""
  });

  // NPK Predictor state (based on previous crop removal)
  const [npkForm, setNpkForm] = useState({
    pastCropType: "Wheat",
    area: "1",
    areaUnit: "ha" as "ha" | "m2",
    yieldValue: "",
    yieldUnit: "kg_ha" as "kg_ha" | "t_ha",
  });
  const [npkResult, setNpkResult] = useState<{ N: number; P: number; K: number; ph: number } | null>(null);
  const [copied, setCopied] = useState<{ which: "npk" | "all" | "ph" | null }>({ which: null });

  const handleNpkChange = (field: string, value: string) => {
    setNpkForm(prev => ({ ...prev, [field]: value }));
  };

  // Nutrient removal coefficients (kg nutrient per ton of harvested yield)
  const REMOVAL_COEFFICIENTS: Record<string, { N: number; P: number; K: number }> = {
    Rice: { N: 18, P: 8, K: 20 },
    Wheat: { N: 22, P: 9, K: 20 },
    Corn: { N: 25, P: 10, K: 25 },
    Soybean: { N: 70, P: 15, K: 30 },
    Cotton: { N: 30, P: 12, K: 35 },
    Sugarcane: { N: 1.2, P: 0.5, K: 1.8 },
    Potato: { N: 3.5, P: 1.3, K: 5.5 },
    Tomato: { N: 3, P: 1.2, K: 4.5 },
  };

  const convertYieldToTonsPerHa = (): number => {
    const value = parseFloat(npkForm.yieldValue || "0");
    if (!value || value <= 0) return 0;
    return npkForm.yieldUnit === "t_ha" ? value : value / 1000; // kg/ha -> t/ha
  };

  // Calculate based on previous crop nutrient removal
  const calculateNpkRecommendation = () => {
    const yieldTPerHa = convertYieldToTonsPerHa();
    if (yieldTPerHa <= 0) {
      setError("Please enter a valid yield value.");
      return;
    }

    const coeff = REMOVAL_COEFFICIENTS[npkForm.pastCropType] || { N: 20, P: 8, K: 20 };
    const removedPerHa = {
      N: coeff.N * yieldTPerHa,
      P: coeff.P * yieldTPerHa,
      K: coeff.K * yieldTPerHa,
    };

    const efficiency = 0.6; // 60% use efficiency
    const recommendPerHa = {
      N: Math.round((removedPerHa.N / efficiency) * 10) / 10,
      P: Math.round((removedPerHa.P / efficiency) * 10) / 10,
      K: Math.round((removedPerHa.K / efficiency) * 10) / 10,
    };

    const cropData: any = (CROP_DATABASE as any)[npkForm.pastCropType as keyof typeof CROP_DATABASE];
    const ph = cropData ? (cropData.optimal.ph[0] + cropData.optimal.ph[1]) / 2 : 6.5;

    setNpkResult({ ...recommendPerHa, ph: Math.round(ph * 10) / 10 });
  };

  const copyText = async (text: string, which: "npk" | "ph" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ which });
      setTimeout(() => setCopied({ which: null }), 1200);
    } catch {}
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setLoadingStep("Analyzing soil parameters...");
    
    try {
      const soilParams = {
        nitrogen: parseFloat(manualData.nitrogen),
        phosphorus: parseFloat(manualData.phosphorus),
        potassium: parseFloat(manualData.potassium),
        ph: parseFloat(manualData.ph)
      };

      const response = await predictCropManual(soilParams);
      
      if (response.success && response.data) {
        setPrediction(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to generate prediction");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError("");
    setLoadingStep("Getting your location...");

    try {
      const locationResponse = await getCurrentLocation();
      
      if (locationResponse.success && locationResponse.data) {
        setAiData(prev => ({ 
          ...prev, 
          location: locationResponse.data!,
          locationInput: locationResponse.data!.address 
        }));
        
        // Automatically fetch soil data
        await fetchSoilData(locationResponse.data);
      } else {
        setError(locationResponse.message);
      }
    } catch (error) {
      setError("Failed to get location");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleSearchLocation = async () => {
    if (!aiData.locationInput.trim()) return;
    
    setIsLoading(true);
    setError("");
    setLoadingStep("Searching location...");

    try {
      const locationResponse = await searchLocation(aiData.locationInput);
      
      if (locationResponse.success && locationResponse.data) {
        setAiData(prev => ({ 
          ...prev, 
          location: locationResponse.data!,
          locationInput: locationResponse.data!.address 
        }));
        
        // Automatically fetch soil data
        await fetchSoilData(locationResponse.data);
      } else {
        setError(locationResponse.message);
      }
    } catch (error) {
      setError("Failed to search location");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const fetchSoilData = async (location: LocationData) => {
    setLoadingStep("Fetching soil data from SoilGrids...");
    
    try {
      const soilResponse = await getSoilData(location.latitude, location.longitude);
      
      if (soilResponse.success && soilResponse.data) {
        setAiData(prev => ({ 
          ...prev, 
          soilGridsData: soilResponse.data! 
        }));
      } else {
        setError("Failed to fetch soil data");
      }
    } catch (error) {
      setError("Failed to fetch soil data");
    }
  };

  const handleAIPredict = async () => {
    if (!aiData.location || !aiData.soilGridsData) {
      setError("Please get location and soil data first");
      return;
    }

    setIsLoading(true);
    setError("");
    setLoadingStep("AI analyzing your location and soil...");
    
    try {
      const response = await predictCropAI(aiData.location, aiData.soilGridsData);
      
      if (response.success && response.data) {
        setPrediction(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to generate AI prediction");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const resetPrediction = () => {
    setPrediction(null);
    setError("");
    setManualData({
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      ph: ""
    });
    setAiData({
      location: null,
      soilGridsData: null,
      locationInput: ""
    });
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-800 hover:text-green-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-800">CropPredict</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Crop Yield Prediction
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Get accurate crop yield predictions using AI or by entering soil parameters manually
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        {!prediction ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Prediction Methods */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="manual" className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4" />
                    <span>Manual Entry</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>AI Prediction</span>
                  </TabsTrigger>
                  <TabsTrigger value="npk" className="flex items-center space-x-2">
                    <Beaker className="w-4 h-4" />
                    <span>NPK Predictor</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6">
                  <Card className="border-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Beaker className="w-5 h-5 text-green-600" />
                        <span>Soil Parameters</span>
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        Enter the soil composition values to get a precise yield prediction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleManualPredict} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Nitrogen */}
                          <div className="space-y-2">
                            <Label htmlFor="nitrogen" className="flex items-center space-x-2 text-gray-800">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>Nitrogen (N) - ppm</span>
                            </Label>
                            <Input
                              id="nitrogen"
                              type="number"
                              placeholder="e.g., 40"
                              value={manualData.nitrogen}
                              onChange={(e) => handleManualInputChange("nitrogen", e.target.value)}
                              className="border-green-200 focus:border-green-500"
                              required
                            />
                          </div>

                          {/* Phosphorus */}
                          <div className="space-y-2">
                            <Label htmlFor="phosphorus" className="flex items-center space-x-2 text-gray-800">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span>Phosphorus (P) - ppm</span>
                            </Label>
                            <Input
                              id="phosphorus"
                              type="number"
                              placeholder="e.g., 60"
                              value={manualData.phosphorus}
                              onChange={(e) => handleManualInputChange("phosphorus", e.target.value)}
                              className="border-green-200 focus:border-green-500"
                              required
                            />
                          </div>

                          {/* Potassium */}
                          <div className="space-y-2">
                            <Label htmlFor="potassium" className="flex items-center space-x-2 text-gray-800">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span>Potassium (K) - ppm</span>
                            </Label>
                            <Input
                              id="potassium"
                              type="number"
                              placeholder="e.g., 20"
                              value={manualData.potassium}
                              onChange={(e) => handleManualInputChange("potassium", e.target.value)}
                              className="border-green-200 focus:border-green-500"
                              required
                            />
                          </div>

                          {/* pH */}
                          <div className="space-y-2">
                            <Label htmlFor="ph" className="flex items-center space-x-2 text-gray-800">
                              <Droplets className="w-4 h-4 text-green-600" />
                              <span>pH Level</span>
                            </Label>
                            <Input
                              id="ph"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 6.5"
                              value={manualData.ph}
                              onChange={(e) => handleManualInputChange("ph", e.target.value)}
                              className="border-green-200 focus:border-green-500"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>{loadingStep || "Analyzing Soil..."}</span>
                            </div>
                          ) : (
                            <>
                              <TrendingUp className="w-5 h-5 mr-2" />
                              Predict Crop Yield
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6">
                  {/* Location Input */}
                  <Card className="border-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span>Location</span>
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        Get your location to analyze local soil and weather conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3">
                        <Button
                          onClick={handleGetCurrentLocation}
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Use Current Location
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-green-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-green-50 text-gray-700">Or search manually</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter city, state, or address"
                          value={aiData.locationInput}
                          onChange={(e) => setAiData(prev => ({ ...prev, locationInput: e.target.value }))}
                          className="border-green-200 focus:border-green-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                        />
                        <Button
                          onClick={handleSearchLocation}
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          disabled={isLoading || !aiData.locationInput.trim()}
                        >
                          Search
                        </Button>
                      </div>

                      {aiData.location && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-green-800 font-medium">📍 {aiData.location.address}</p>
                          <p className="text-green-600 text-sm">
                            {aiData.location.latitude.toFixed(4)}, {aiData.location.longitude.toFixed(4)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Soil Data Display */}
                  {aiData.soilGridsData && (
                    <Card className="border-green-100">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Satellite className="w-5 h-5 text-green-600" />
                          <span>SoilGrids Analysis</span>
                        </CardTitle>
                        <CardDescription className="text-gray-700">
                          Soil composition data from global soil database
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-800">Nitrogen (N):</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.nitrogen} ppm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">Phosphorus (P):</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.phosphorus} ppm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">Potassium (K):</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.potassium} ppm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">pH Level:</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.ph}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-800">Clay Content:</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.clay_content}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">Sand Content:</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.sand_content}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">Organic Carbon:</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.organic_carbon} g/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-800">Bulk Density:</span>
                              <span className="font-medium text-gray-900">{aiData.soilGridsData.bulk_density} g/cm³</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Prediction Button */}
                  <Card className="border-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-green-600" />
                        <span>AI Analysis</span>
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        Advanced prediction using location-based soil and climate data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleAIPredict}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
                        disabled={isLoading || !aiData.location || !aiData.soilGridsData}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{loadingStep || "AI Processing..."}</span>
                          </div>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Start AI Prediction
                          </>
                        )}
                      </Button>
                      
                      {(!aiData.location || !aiData.soilGridsData) && (
                        <p className="text-sm text-gray-700 text-center mt-2">
                          Please set your location to enable AI prediction
                        </p>
                      )}
                    </CardContent>
                  </Card>

                </TabsContent>

                {/* Dedicated NPK tab */}
                <TabsContent value="npk" className="space-y-6">
                  {/* NPK Predictor (based on previous crop) */}
                  {true ? (
                    <Card className="border-green-100">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Beaker className="w-5 h-5 text-green-600" />
                          <span>NPK Predictor</span>
                        </CardTitle>
                        <CardDescription className="text-gray-700">Predict optimal NPK and pH values based on your previous crop data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-800">Past Crop Type</Label>
                            <Select value={npkForm.pastCropType} onValueChange={(v) => handleNpkChange("pastCropType", v)}>
                              <SelectTrigger className="border-green-200 focus:border-green-500">
                                <SelectValue placeholder="Select crop" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys((CROP_DATABASE as any)).map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-800">Area of Crop</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={npkForm.area}
                                onChange={(e) => handleNpkChange("area", e.target.value)}
                                className="border-green-200 focus:border-green-500"
                              />
                              <Select value={npkForm.areaUnit} onValueChange={(v) => handleNpkChange("areaUnit", v)}>
                                <SelectTrigger className="border-green-200 focus:border-green-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="m2">Square Meters (m²)</SelectItem>
                                  <SelectItem value="ha">Hectares (ha)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-800">Yield Obtained</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={npkForm.yieldValue}
                                onChange={(e) => handleNpkChange("yieldValue", e.target.value)}
                                className="border-green-200 focus:border-green-500"
                              />
                              <Select value={npkForm.yieldUnit} onValueChange={(v) => handleNpkChange("yieldUnit", v)}>
                                <SelectTrigger className="border-green-200 focus:border-green-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg_ha">Kg per Hectare (kg/ha)</SelectItem>
                                  <SelectItem value="t_ha">Tons per Hectare (t/ha)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={calculateNpkRecommendation}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Predict NPK Values
                        </Button>

                        {npkResult && (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-gray-900 font-semibold mb-3">NPK Values (kg/hectare)</h4>
                                <div className="grid grid-cols-3 gap-3">
                                  {(["N","P","K"] as const).map(key => (
                                    <div key={key} className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                                      <div className="text-2xl font-bold text-green-700">{(npkResult as any)[key]}</div>
                                      <div className="text-xs text-gray-700 mt-1">
                                        {key === "N" ? "Nitrogen" : key === "P" ? "Phosphorus" : "Potassium"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-700 mt-2">Calculated from previous crop nutrient removal and 60% fertilizer efficiency.</p>
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => copyText(`N: ${npkResult.N} kg/ha, P: ${npkResult.P} kg/ha, K: ${npkResult.K} kg/ha`, "npk")}
                                  >
                                    {copied.which === "npk" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    Copy NPK Values
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-gray-900 font-semibold">Soil pH Recommendation</h4>
                              <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                                <div className="text-3xl font-bold text-green-700">{npkResult.ph}</div>
                                <div className="text-sm text-gray-700 mt-1">Optimal pH Level</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => copyText(`${npkResult.ph}`, "ph")}
                                >
                                  {copied.which === "ph" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                  Copy pH
                                </Button>
                                <Button
                                  type="button"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => copyText(`N: ${npkResult.N} kg/ha, P: ${npkResult.P} kg/ha, K: ${npkResult.K} kg/ha, pH: ${npkResult.ph}`, "all")}
                                >
                                  {copied.which === "all" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                  Copy All
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-green-100">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Beaker className="w-5 h-5 text-green-600" />
                          <span>NPK Predictor</span>
                        </CardTitle>
                        <CardDescription className="text-gray-700">Use the form above to get NPK suggestions.</CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Information Panel */}
            <div className="space-y-6">
              <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                  <CardTitle className="text-green-800">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-semibold">1</span>
                      </div>
                      <span className="text-gray-800">Enter soil parameters or use AI analysis</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-semibold">2</span>
                      </div>
                      <span className="text-gray-800">Our algorithm processes the data</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 font-semibold">3</span>
                      </div>
                      <span className="text-gray-800">Get detailed yield predictions and recommendations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-gray-800">Optimal Ranges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-800">Nitrogen (N):</span>
                    <span className="font-medium text-gray-900">20-80 ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Phosphorus (P):</span>
                    <span className="font-medium text-gray-900">10-70 ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Potassium (K):</span>
                    <span className="font-medium text-gray-900">10-40 ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">pH Level:</span>
                    <span className="font-medium text-gray-900">5.5-8.0</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Prediction Results */
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-green-800 mb-2">
                  Prediction Complete!
                </CardTitle>
                <div className="flex justify-center space-x-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {prediction.crop_type}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {prediction.confidence}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {prediction.yield_prediction}%
                  </div>
                  <p className="text-gray-800">Expected Yield Success Rate</p>
                  <Progress value={prediction.yield_prediction} className="mt-4 h-3" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Expected Harvest</h4>
                    <p className="text-green-600 font-medium">{prediction.expected_harvest_date}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Estimated Yield</h4>
                    <p className="text-green-600 font-medium">{prediction.estimated_yield}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {prediction.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetPrediction} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                New Prediction
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Save Results
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}