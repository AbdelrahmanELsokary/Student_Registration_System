import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
  }, [i18n.language]);

  return (
    <header className="bg-green-600/90 shadow-md sticky top-0 z-50 rounded-b-lg">
      <nav className={`container mx-auto px-4 py-4 flex flex-col sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''} items-center justify-between gap-6 sm:gap-0`}>
        <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <Link to="/" aria-label="Home" className="flex-shrink-0">
            <div className="h-28 w-28 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
              <img src="/assets/images/logo.webp" alt="logo" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Link>
          <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight max-w-xs sm:max-w-none">
            {t('navbar.title')}
            <br />
            <span className="font-sans text-lg sm:text-xl">{t('navbar.subtitle')}</span>
          </h1>
        </div>
        <div className={`flex flex-wrap gap-3 sm:flex-nowrap ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'} items-center justify-center sm:justify-end w-full sm:w-auto`}>
          <Link to="/" className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 text-center min-w-[120px]">
            {t('navbar.addStudent')}
          </Link>
          <Link
            to="/students"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 text-center min-w-[120px]"
          >
            {t('navbar.viewStudents')}
          </Link>
          <Link
            to="/attendance"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 text-center min-w-[120px]"
          >
            {t('navbar.attendance')}
          </Link>
          <Link
            to="/attendance-summary"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 text-center min-w-[120px]"
          >
            {t('navbar.attendanceSummary')}
          </Link>
          <div className="ml-0 sm:ml-4 flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
