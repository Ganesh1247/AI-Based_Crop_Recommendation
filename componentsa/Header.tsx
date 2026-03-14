import { Leaf, Menu, X, User, LogOut, Sun, Moon, CloudRain, TrendingUp, TestTube, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useTheme } from "next-themes";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../lib/context/LanguageContext";
import { useAuth } from "../lib/context/AuthContext";

interface HeaderProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onProfileClick?: () => void;
  onFeaturesClick?: () => void;
  onWeatherClick?: () => void;
  onMarketClick?: () => void;
  onSoilClick?: () => void;
  onVoiceClick?: () => void;
}

export function Header({ 
  onSignInClick, 
  onSignUpClick, 
  onProfileClick, 
  onFeaturesClick,
  onWeatherClick,
  onMarketClick,
  onSoilClick,
  onVoiceClick
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed w-full top-0 z-50 glass-panel border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl shadow-lg flex items-center justify-center transform transition-transform hover:scale-105">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 tracking-tight">
              {t('header.cropPredict')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative group"
            >
              {t('header.home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={onFeaturesClick || (() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }))}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative group"
            >
              {t('header.features')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={onWeatherClick}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative group"
            >
              {t('features.weather.title') || 'Weather'}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={onSoilClick}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative group"
            >
              {t('features.soil.title') || 'Soil Analysis'}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={onMarketClick}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative group"
            >
              {t('features.market.title') || 'Market Trends'}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <LanguageSelector />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onProfileClick}
                  className="flex items-center space-x-2 text-gray-800 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-100"
                >
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{t('header.welcome')}, {user.name}</div>
                  </div>
                </button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={onSignInClick}
                  className="font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                >
                  {t('header.signIn')}
                </Button>
                <Button 
                  onClick={onSignUpClick}
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-medium rounded-full px-6"
                >
                  {t('header.signUp')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-green-600 py-2 text-left"
              >
                {t('header.home')}
              </button>
              <button 
                onClick={() => {
                  if (onFeaturesClick) {
                    onFeaturesClick();
                  } else {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-green-600 py-2 text-left"
              >
                {t('header.features')}
              </button>

              {/* Mobile Extended Feature Links */}
              <div className="flex flex-col space-y-1 py-2 mb-2 border-y border-slate-100 dark:border-slate-800/50 pl-4">
                <button 
                  onClick={() => { onWeatherClick?.(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 py-2 text-left text-sm"
                >
                  <CloudRain className="w-4 h-4 text-emerald-500" />
                  <span>Weather Integration</span>
                </button>
                <button 
                  onClick={() => { onMarketClick?.(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 py-2 text-left text-sm"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Market Trends</span>
                </button>
                <button 
                  onClick={() => { onSoilClick?.(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 py-2 text-left text-sm"
                >
                  <TestTube className="w-4 h-4 text-emerald-500" />
                  <span>Soil Analysis</span>
                </button>
                <button 
                  onClick={() => { onVoiceClick?.(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 py-2 text-left text-sm"
                >
                  <Mic className="w-4 h-4 text-emerald-500" />
                  <span>Voice Assistant</span>
                </button>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                <div className="flex items-center justify-between pb-2">
                  <LanguageSelector />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full w-9 h-9 border border-slate-200 dark:border-slate-800"
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
                
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={onProfileClick}
                      className="flex items-center space-x-2 p-2 bg-green-100 rounded-lg w-full hover:bg-green-200 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{t('header.welcome')}, {user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                      </div>
                    </button>
                    <Button 
                      variant="outline"
                      onClick={logout}
                      className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('header.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={onSignInClick}
                    >
                      {t('header.signIn')}
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={onSignUpClick}
                    >
                      {t('header.signUp')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}