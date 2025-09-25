import { 
  Brain, 
  BarChart3, 
  CloudRain, 
  MapPin,
  TrendingUp,
  MessageCircle,
  Scan,
  Mic,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "../lib/context/LanguageContext";

interface FeatureTilesProps {
  onPredictClick?: () => void;
  onWeatherClick?: () => void;
  onSoilClick?: () => void;
  onMarketClick?: () => void;
  onChatClick?: () => void;
  onDiseaseClick?: () => void;
  onVoiceClick?: () => void;
}

export function FeatureTiles({ onPredictClick, onWeatherClick, onSoilClick, onMarketClick, onChatClick, onDiseaseClick, onVoiceClick }: FeatureTilesProps) {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: CloudRain,
      title: t('features.weather.title'),
      description: t('features.weather.desc'),
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      path: "/weather",
      onClick: onWeatherClick
    },
    {
      icon: MapPin,
      title: t('features.soil.title'),
      description: t('features.soil.desc'),
      color: "bg-emerald-600",
      hoverColor: "hover:bg-emerald-700",
      path: "/soil",
      onClick: onSoilClick
    },
    {
      icon: TrendingUp,
      title: t('features.market.title'),
      description: t('features.market.desc'),
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      path: "/market",
      onClick: onMarketClick
    },
    {
      icon: MessageCircle,
      title: t('features.chat.title'),
      description: t('features.chat.desc'),
      color: "bg-teal-500",
      hoverColor: "hover:bg-teal-600",
      path: "/chat",
      onClick: onChatClick
    },
    {
      icon: Mic,
      title: t('features.voice.title'),
      description: t('features.voice.desc'),
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
      path: "/voice",
      onClick: onVoiceClick
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Special Features - Highlighted Cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('features.coreTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.coreSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Predict Now - Special Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('features.cropPrediction')}</h3>
                <p className="text-green-50 mb-6 leading-relaxed">
                  {t('features.cropPredictionDesc')}
                </p>
                <Button 
                  onClick={onPredictClick}
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl"
                >
                  {t('hero.predictNow')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            
            {/* Detect Disease - Special Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Scan className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('features.diseaseDetection')}</h3>
                <p className="text-purple-50 mb-6 leading-relaxed">
                  {t('features.diseaseDetectionDesc')}
                </p>
                <Button 
                  onClick={onDiseaseClick}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl"
                >
                  {t('hero.detectDisease')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('features.additionalTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.additionalSubtitle')}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-200"
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    onClick={feature.onClick}
                  >
                    {t('features.accessFeature')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 lg:p-12 shadow-2xl">
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            {t('features.transformTitle')}
          </h3>
          <p className="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
            {t('features.transformSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl">
              {t('features.getStarted')}
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl">
              {t('features.watchDemo')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}