import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useLanguage, Language } from '../lib/context/LanguageContext';

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు' }
];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-green-200 text-green-700 hover:bg-green-50 focus:ring-green-500"
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentLanguage?.nativeName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-700 border-b border-gray-100">
            {t('header.language')}
          </div>
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              size="sm"
              className={`w-full justify-start h-auto px-2 py-2 ${
                language === lang.code 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}