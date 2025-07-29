import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 transition">
        <Globe className="w-4 h-4" />
        <span className="capitalize">{i18n.language === 'ar' ? 'العربية' : 'English'}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg">
          <button onClick={() => changeLanguage('en')} className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${i18n.language === 'en' ? 'font-bold text-blue-600' : ''}`}>
            🇺🇸 English
          </button>
          <button onClick={() => changeLanguage('ar')} className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${i18n.language === 'ar' ? 'font-bold text-blue-600' : ''}`}>
            🇪🇬 العربية
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
