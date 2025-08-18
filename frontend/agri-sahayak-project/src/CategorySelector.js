import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Landmark, TrendingUp, CloudSun, Milk } from 'lucide-react';

const CategorySelector = ({ onSelectCategory }) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const categories = [
    {
      key: 'farming',
      nameEn: 'Crop Advisory',
      nameHi: 'फसल सलाह',
      subtitleEn: 'Get expert crop guidance',
      subtitleHi: 'विशेषज्ञ फसल मार्गदर्शन पाएं',
      Icon: Sprout,
      gradient: 'from-green-400/20 to-emerald-500/20',
    },
    {
      key: 'loans',
      nameEn: 'Finance & Loans',
      nameHi: 'वित्त और ऋण',
      subtitleEn: 'Access credit easily',
      subtitleHi: 'आसानी से ऋण प्राप्त करें',
      Icon: Landmark,
      gradient: 'from-amber-400/20 to-orange-500/20',
    },
    {
      key: 'market_prices',
      nameEn: 'Market Prices',
      nameHi: 'बाज़ार भाव',
      subtitleEn: 'Track mandi trends',
      subtitleHi: 'मंडी रुझान देखें',
      Icon: TrendingUp,
      gradient: 'from-sky-400/20 to-blue-600/20',
    },
    {
      key: 'weather',
      nameEn: 'Weather',
      nameHi: 'मौसम',
      subtitleEn: 'Plan with forecasts',
      subtitleHi: 'पूर्वानुमान के साथ योजना बनाएं',
      Icon: CloudSun,
      gradient: 'from-cyan-400/20 to-indigo-500/20',
    },
    {
      key: 'livestock',
      nameEn: 'Livestock & Dairy',
      nameHi: 'पशुपालन और डेयरी',
      subtitleEn: 'Care and productivity',
      subtitleHi: 'देखभाल और उत्पादकता',
      Icon: Milk,
      gradient: 'from-fuchsia-400/20 to-pink-500/20',
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-transparent">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-agri-primary dark:text-gray-100">
        {t('quickStart') || 'Quick Start'}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map(({ key, nameEn, nameHi, subtitleEn, subtitleHi, Icon, gradient }) => (
          <button
            key={key}
            onClick={() => onSelectCategory(key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCategory(key);
              }
            }}
            className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-agri-primary/40 dark:focus-visible:ring-white/30 transition-all duration-300 ease-out shadow-agri-sm hover:shadow-agri-xl hover:scale-[1.02] bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60`}
            aria-label={isHi ? nameHi : nameEn}
          >
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradient} opacity-70 group-hover:opacity-90 transition-opacity duration-300`} />
            <div className="absolute -inset-px rounded-2xl ring-1 ring-transparent group-hover:ring-agri-primary/30 dark:group-hover:ring-white/20 transition" />

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-white/50 dark:border-gray-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Icon size={28} className="text-agri-primary dark:text-agri-success" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-agri-primary dark:text-gray-100">
                  {isHi ? nameHi : nameEn}
                </p>
                <p className="text-[11px] sm:text-xs mt-1 text-agri-secondary/90 dark:text-gray-400">
                  {isHi ? subtitleHi : subtitleEn}
                </p>
              </div>
            </div>

            {/* Animated gradient highlight */}
            <div className="pointer-events-none absolute -bottom-10 right-0 w-24 h-24 rounded-full bg-gradient-to-tr from-agri-primary/20 to-transparent blur-2xl group-hover:translate-y-2 transition-transform duration-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;

