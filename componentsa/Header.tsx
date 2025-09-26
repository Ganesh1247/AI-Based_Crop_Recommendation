import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../lib/context/LanguageContext";
import { useAuth } from "../lib/context/AuthContext";

interface HeaderProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onProfileClick?: () => void;
  onFeaturesClick?: () => void;
}

export function Header({ onSignInClick, onSignUpClick, onProfileClick, onFeaturesClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="bg-green-50 border-b border-green-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-gray-800">{t('header.cropPredict')}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              {t('header.home')}
            </button>
            <button 
              onClick={onFeaturesClick || (() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }))}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              {t('header.features')}
            </button>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
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
                  variant="outline" 
                  onClick={onSignInClick}
                >
                  {t('header.signIn')}
                </Button>
                <Button 
                  onClick={onSignUpClick}
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
              <div className="flex flex-col space-y-2 pt-4">
                <div className="pb-2">
                  <LanguageSelector />
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