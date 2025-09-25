import { ArrowRight, Leaf, Scan, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../lib/context/LanguageContext";

interface HeroProps {
  onPredictClick?: () => void;
  onDiseaseClick?: () => void;
}

export function Hero({ onPredictClick, onDiseaseClick }: HeroProps) {
  const { t } = useLanguage();
  
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-green-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-primary">
              <Leaf className="w-5 h-5" />
              <span className="font-medium">{t('hero.smartAgriculture')}</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('hero.aiPowered')}<br />
                <span className="text-primary">{t('hero.cropSolutions')}</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg" onClick={onPredictClick}>
                <Brain className="w-5 h-5 mr-2" />
                {t('hero.predictNow')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg" onClick={onDiseaseClick}>
                <Scan className="w-5 h-5 mr-2" />
                {t('hero.detectDisease')}
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">{t('hero.accuracyRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">{t('hero.farmersTrust')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">{t('hero.cropTypes')}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1757525473930-0b82237e55ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGFncmljdWx0dXJhbCUyMGNyb3BzJTIwZmFybWluZ3xlbnwxfHx8fDE3NTgzNTUzMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Green agricultural crops and farming"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-card-foreground">{t('hero.predictionReady')}</div>
                  <div className="text-xs text-muted-foreground">{t('hero.cornYield')}</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card rounded-xl shadow-lg p-4 border border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">+23%</div>
                <div className="text-xs text-muted-foreground">{t('hero.yieldIncrease')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}