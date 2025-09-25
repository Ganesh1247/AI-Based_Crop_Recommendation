import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "../lib/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">{t('header.cropPredict')}</span>
            </div>
            <p className="text-muted leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.features')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Crop Predictor</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Weather Integration</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Soil Analysis</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Market Trends</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">{t('header.home')}</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">{t('header.features')}</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">{t('header.about')}</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-muted">support@croppredict.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-muted">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-muted">Global Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-muted/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted text-sm">
            © 2025 {t('header.cropPredict')}. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}