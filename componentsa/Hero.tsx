import { ArrowRight, Leaf, Scan, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../lib/context/LanguageContext";

interface HeroProps {
  onPredictClick?: () => void;
  onDiseaseClick?: () => void;
  onSignUpClick?: () => void;
  onWeatherClick?: () => void;
  onMarketClick?: () => void;
  onSoilClick?: () => void;
}

export function Hero({ 
  onPredictClick, 
  onDiseaseClick, 
  onSignUpClick, 
  onWeatherClick, 
  onMarketClick, 
  onSoilClick 
}: HeroProps) {
  const { t } = useLanguage();
  
  return (
    <section className="relative bg-slate-50 dark:bg-slate-900 py-24 lg:py-40 overflow-hidden">
      {/* Background modern ambient glow */}
      <div className="absolute top-0 inset-x-0 h-full w-full pointer-events-none opacity-40 dark:opacity-20 flex justify-center overflow-hidden">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-emerald-500/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="inline-flex items-center space-x-2 bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <Leaf className="w-4 h-4" />
              <span className="font-semibold text-sm uppercase tracking-wider">{t('hero.smartAgriculture')}</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {t('hero.aiPowered')}<br />
                <span className="text-gradient inline-block mt-2">{t('hero.cropSolutions')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-light">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-2">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold px-8 py-7 text-lg rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" onClick={onDiseaseClick}>
                <Scan className="w-5 h-5 mr-3" />
                {t('features.diseaseDetection') || "Disease Detection"}
                <ArrowRight className="w-5 h-5 ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 font-semibold px-8 py-7 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300" onClick={onPredictClick}>
                <Brain className="w-5 h-5 mr-3" />
                {t('hero.predictNow')}
              </Button>
            </div>

            {/* Feature Quick Links */}
            <div className="pt-8 flex flex-wrap gap-3">
              <button onClick={onWeatherClick} className="inline-flex items-center px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                ☁️ {t('features.weather.title')}
              </button>
              <button onClick={onSoilClick} className="inline-flex items-center px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                🌱 {t('features.soil.title')}
              </button>
              <button onClick={onMarketClick} className="inline-flex items-center px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                📈 {t('features.market.title')}
              </button>
            </div>

            <div className="flex items-center space-x-10 pt-10 border-t border-slate-200 dark:border-slate-800 mt-10">
              <div className="text-left">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">95%</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('hero.accuracyRate')}</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">10K+</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('hero.farmersTrust')}</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">50+</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('hero.cropTypes')}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative mt-12 lg:mt-0 lg:ml-10">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white/50 dark:border-slate-800/50">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay z-10"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxqYW1lcyUyMHBhcmt8ZW58MHx8fDE3NTgzODgyODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern AI agricultural farming"
                className="w-full h-[500px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent z-10"></div>
            </div>
            
            {/* Floating Cards with Glassmorphism */}
            <div className="absolute -bottom-8 -left-8 lg:-left-12 glass-card rounded-2xl p-5 z-20 animate-float">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800 dark:text-white">{t('hero.predictionReady')}</div>
                  <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t('hero.cornYield')}</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-8 -right-8 glass-card rounded-2xl p-5 z-20 animate-float-slow">
              <div className="text-center px-4">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">+23%</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wide">{t('hero.yieldIncrease')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}