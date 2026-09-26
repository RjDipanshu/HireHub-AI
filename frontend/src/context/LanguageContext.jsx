import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TRANSLATIONS = {
  en: {
    // Nav
    'nav.explore_jobs': 'Explore Jobs',
    'nav.salaries': 'Salaries & Insights',
    'nav.support': 'Support',
    'nav.dashboard': 'Dashboard',
    'nav.sign_in': 'Sign In',
    'nav.get_started': 'Get Started',
    'nav.sign_out': 'Sign Out',
    'nav.theme': 'Theme',
    'nav.language': 'Language',
    // Search & Hero
    'hero.title': 'Find Your Next Career Move with AI Precision',
    'hero.subtitle': 'Connect with top tech companies through automated semantic matching, verified skill assessments, and real salary intelligence.',
    'search.role_placeholder': 'Job title, skill, or keyword...',
    'search.city_placeholder': 'City, state, or Remote...',
    'search.button': 'Search Jobs',
    // Common Actions
    'action.apply_now': 'Apply Now',
    'action.save_job': 'Save Job',
    'action.download': 'Download',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.save': 'Save Changes',
    // Dashboard & Modules
    'dash.welcome': 'Welcome back',
    'dash.my_applications': 'My Applications',
    'dash.interviews': 'Interviews',
    'dash.resume_builder': 'ATS Resume Studio',
    'dash.privacy_security': 'Privacy & Security',
  },
  hi: {
    // Nav
    'nav.explore_jobs': 'नौकरियां खोजें',
    'nav.salaries': 'वेतन और इनसाइट्स',
    'nav.support': 'सहायता',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.sign_in': 'साइन इन',
    'nav.get_started': 'शुरू करें',
    'nav.sign_out': 'लॉग आउट',
    'nav.theme': 'थीम',
    'nav.language': 'भाषा',
    // Search & Hero
    'hero.title': 'AI सटीकता के साथ अपना अगला करियर कदम खोजें',
    'hero.subtitle': 'सटीक सिमेंटिक मैचिंग, सत्यापित कौशल मूल्यांकन और वास्तविक वेतन डेटा के माध्यम से शीर्ष तकनीकी कंपनियों से जुड़ें।',
    'search.role_placeholder': 'पद, कौशल, या कीवर्ड...',
    'search.city_placeholder': 'शहर, राज्य, या रिमोट...',
    'search.button': 'नौकरी खोजें',
    // Common Actions
    'action.apply_now': 'अभी आवेदन करें',
    'action.save_job': 'नौकरी सेव करें',
    'action.download': 'डाउनलोड',
    'action.cancel': 'रद्द करें',
    'action.confirm': 'पुष्टि करें',
    'action.save': 'परिवर्तन सेव करें',
    // Dashboard & Modules
    'dash.welcome': 'वापसी पर स्वागत है',
    'dash.my_applications': 'मेरे आवेदन',
    'dash.interviews': 'साक्षात्कार',
    'dash.resume_builder': 'बायोडाटा बिल्डर (ATS)',
    'dash.privacy_security': 'गोपनीयता और सुरक्षा',
  },
  es: {
    // Nav
    'nav.explore_jobs': 'Explorar Empleos',
    'nav.salaries': 'Salarios y Métricas',
    'nav.support': 'Soporte',
    'nav.dashboard': 'Panel de Control',
    'nav.sign_in': 'Iniciar Sesión',
    'nav.get_started': 'Comenzar',
    'nav.sign_out': 'Cerrar Sesión',
    'nav.theme': 'Tema',
    'nav.language': 'Idioma',
    // Search & Hero
    'hero.title': 'Encuentra tu próximo paso profesional con IA',
    'hero.subtitle': 'Conéctate con las mejores empresas de tecnología a través de emparejamiento semántico, evaluaciones verificadas y salarios reales.',
    'search.role_placeholder': 'Título, habilidad o palabra clave...',
    'search.city_placeholder': 'Ciudad o Remoto...',
    'search.button': 'Buscar Empleos',
    // Common Actions
    'action.apply_now': 'Postularme',
    'action.save_job': 'Guardar Empleo',
    'action.download': 'Descargar',
    'action.cancel': 'Cancelar',
    'action.confirm': 'Confirmar',
    'action.save': 'Guardar Cambios',
    // Dashboard & Modules
    'dash.welcome': 'Bienvenido de nuevo',
    'dash.my_applications': 'Mis Solicitudes',
    'dash.interviews': 'Entrevistas',
    'dash.resume_builder': 'Generador de Currículum ATS',
    'dash.privacy_security': 'Privacidad y Seguridad',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem('hirehub_lang');
      if (stored && TRANSLATIONS[stored]) return stored;
      const browserLang = navigator.language?.slice(0, 2);
      if (browserLang && TRANSLATIONS[browserLang]) return browserLang;
    } catch {}
    return 'en';
  });

  const changeLanguage = useCallback((newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLang(newLang);
      try {
        localStorage.setItem('hirehub_lang', newLang);
      } catch {}
    }
  }, []);

  const t = useCallback((key, fallback = '') => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || fallback || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, availableLanguages: [
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
      { code: 'es', label: 'Español', flag: '🇪🇸' },
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
