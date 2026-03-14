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
  onSignUpClick?: () => void;
}

export function FeatureTiles({ onPredictClick, onWeatherClick, onSoilClick, onMarketClick, onChatClick, onDiseaseClick, onVoiceClick, onSignUpClick }: FeatureTilesProps) {
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
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Special Features - Highlighted Cards */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              {t('features.coreTitle')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
              {t('features.coreSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Predict Now - Special Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-10 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-emerald-400/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  <Brain className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">{t('features.cropPrediction')}</h3>
                <p className="text-emerald-50 mb-8 leading-relaxed text-lg font-light">
                  {t('features.cropPredictionDesc')}
                </p>
                <Button 
                  onClick={onPredictClick}
                  className="bg-white text-emerald-700 hover:bg-slate-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  {t('hero.predictNow')}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            
            {/* Detect Disease - Special Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-indigo-400/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                  <Scan className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">{t('features.diseaseDetection')}</h3>
                <p className="text-indigo-50 mb-8 leading-relaxed text-lg font-light">
                  {t('features.diseaseDetectionDesc')}
                </p>
                <Button 
                  onClick={onDiseaseClick}
                  className="bg-white text-indigo-700 hover:bg-slate-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  {t('hero.detectDisease')}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16 mt-32">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            {t('features.additionalTitle')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light">
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
                className="group glass-card border-slate-200/60 dark:border-slate-800/60 hover:-translate-y-1 hover:shadow-xl dark:shadow-none transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg"
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-md`}>
                    <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-base font-light">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 font-medium"
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
        <div className="mt-32 text-center bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2.5rem] p-10 lg:p-16 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h3 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">
              {t('features.transformTitle')}
            </h3>
            <p className="text-emerald-50 mb-10 text-xl max-w-2xl mx-auto font-light leading-relaxed opacity-90">
              {t('features.transformSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-50 font-bold px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-lg" onClick={onSignUpClick}>
                {t('features.getStarted')}
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm font-bold px-10 py-7 rounded-full transition-all duration-300 text-lg">
                {t('features.watchDemo')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}