import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { ADDIS_SUB_CITIES, PROPERTY_TYPES } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../constants';

export default function Browse() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    subCity: searchParams.get('subCity') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });
  const [showFilters, setShowFilters] = useState(!!searchParams.get('subCity') || !!searchParams.get('propertyType'));

  // Sync filters with search params when they change (e.g. from Hero search)
  useEffect(() => {
    const subCity = searchParams.get('subCity') || '';
    const propertyType = searchParams.get('propertyType') || '';
    if (subCity || propertyType) {
      setFilters(prev => ({
        ...prev,
        subCity,
        propertyType
      }));
      setShowFilters(true);
    }
  }, [searchParams]);

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let results: any[] = [];
      
      // Try fetching from Firestore
      try {
        // Remove 'approved' filter to show all listed properties for now
        let q = query(collection(db, 'properties'));
        const snap = await getDocs(q);
        results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Sort by createdAt desc in memory
        results.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
      } catch (e: any) {
        console.error("Firestore fetch failed:", e);
        if (e.message?.includes('permissions')) {
          setError("Database access denied. Please check your Firestore Security Rules.");
        } else {
          setError("Failed to connect to the database.");
        }
      }

      // Prioritize real results if any exist, otherwise fallback to mock for demo
      // But don't fallback if we have a specific error
      const allProperties = results.length > 0 ? results : (error ? [] : MOCK_PROPERTIES);
      
      // Remove duplicates by ID (if any)
      const uniqueProperties = Array.from(new Map(allProperties.map(p => [p.id, p])).values());

      let filtered = uniqueProperties;

      if (filters.subCity) {
        filtered = filtered.filter(p => p.subCity === filters.subCity);
      }
      if (filters.propertyType) {
        filtered = filtered.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
      }
      if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= Number(filters.bedrooms));
      }

      setProperties(filtered);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t('browse.title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>{t('filters.title')}</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-2">{t('filters.subCity')}</label>
            <select
              className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              value={filters.subCity}
              onChange={(e) => setFilters({ ...filters, subCity: e.target.value })}
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t('filters.any')}</option>
              {ADDIS_SUB_CITIES.map(c => <option key={c} value={c} className="bg-white dark:bg-zinc-900">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-2">{t('filters.propertyType')}</label>
            <select
              className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <option value="" className="bg-white dark:bg-zinc-900">{t('filters.any')}</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t} className="bg-white dark:bg-zinc-900">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-2">{t('filters.minPrice')}</label>
            <input
              type="number"
              className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-2">{t('filters.maxPrice')}</label>
            <input
              type="number"
              className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={fetchProperties}
              className="flex-1 bg-emerald-600 text-white p-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              {t('common.apply')}
            </button>
            <button
              onClick={() => {
                setFilters({
                  subCity: '',
                  propertyType: '',
                  minPrice: '',
                  maxPrice: '',
                  bedrooms: ''
                });
              }}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Clear Filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl mb-8 text-center">
          <p className="text-amber-800 dark:text-amber-400 font-bold mb-2">{error}</p>
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Guests need "read" permissions in Firestore to view properties.
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">{t('browse.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
