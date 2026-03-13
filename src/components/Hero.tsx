import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Building2 } from 'lucide-react';
import { ADDIS_SUB_CITIES, PROPERTY_TYPES } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subCity, setSubCity] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (subCity) params.set('subCity', subCity);
    if (propertyType) params.set('propertyType', propertyType);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/addis/1920/1080?blur=2"
          alt="Addis Ababa"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-zinc-200 mb-10 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
          <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
            <MapPin className="w-5 h-5 text-zinc-400 mr-2" />
            <select 
              className="w-full bg-transparent py-3 focus:outline-none text-zinc-900 dark:text-white"
              value={subCity}
              onChange={(e) => setSubCity(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t('filters.subCity')}</option>
              {ADDIS_SUB_CITIES.map(city => (
                <option key={city} value={city} className="bg-white dark:bg-zinc-900">{city}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex items-center px-4">
            <Building2 className="w-5 h-5 text-zinc-400 mr-2" />
            <select 
              className="w-full bg-transparent py-3 focus:outline-none text-zinc-900 dark:text-white"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t('filters.propertyType')}</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type} className="bg-white dark:bg-zinc-900">{type}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleSearch}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            {t('hero.searchBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
