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
    <header className="bg-green-600/90 shadow-md mb-8 top-0 sticky z-50 rounded-lg">
      <nav
        className={`container mx-auto px-4 py-4 flex flex-col sm:flex-row ${
          isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'
        } items-center justify-between gap-4 sm:gap-0`}
      >
        {/* Logo and Title */}
        <div
          className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
        >
          <div className="h-24 w-24 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
            <Link to="/">
              <img
                src="/assets/images/logo.webp"
                alt="logo"
                className="h-full w-full object-cover"
              />
            </Link>
          </div>
          <h1 className="text-white text-xl sm:text-2xl font-extrabold leading-tight">
            {t('navbar.title')}
            <br />
            <span className="font-sans">{t('navbar.subtitle')}</span>
          </h1>
        </div>

        {/* Buttons & Language Switcher */}
        <div
          className={`flex flex-col ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'} items-center gap-2 sm:gap-4`}
        >
          <Link
            to="/"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            {t('navbar.addStudent')}
          </Link>
          <Link
            to="/students"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            {t('navbar.viewStudents')}
          </Link>
          <Link
            to="/attendance"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            {t('navbar.attendance')}
          </Link>
          <Link
            to="/attendance-summary"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            {t('navbar.attendanceSummary')}
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
