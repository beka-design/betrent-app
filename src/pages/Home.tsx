import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { motion } from 'motion/react';
import { MOCK_PROPERTIES } from '../constants';

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<any[]>(MOCK_PROPERTIES.filter(p => p.isFeatured).slice(0, 3));
  const [recent, setRecent] = useState<any[]>(MOCK_PROPERTIES.slice(0, 6));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setError(null);
        // Fetch All Properties (removed 'approved' filter to show real data immediately)
        const q = query(
          collection(db, 'properties'),
          limit(50)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Sort in memory
          allDocs.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          
          // Set Featured (just take first 3 for now or those marked featured)
          const featuredDocs = allDocs.filter((p: any) => p.isFeatured).slice(0, 3);
          if (featuredDocs.length > 0) {
            setFeatured(featuredDocs);
          } else {
            setFeatured(allDocs.slice(0, 3));
          }

          // Set Recent
          setRecent(allDocs.slice(0, 6));
        }
      } catch (e: any) {
        console.warn("Home fetch failed:", e);
        if (e.message?.includes('permissions')) {
          setError("Database access restricted. Real listings may be hidden.");
        }
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl text-center text-amber-800 dark:text-amber-400 text-sm font-medium">
            {error} Please check your Firestore Security Rules.
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {t('property.featured')}
          </h2>
          <Link to="/browse" className="text-emerald-600 font-semibold hover:underline">
            {t('common.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 dark:bg-zinc-950 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {t('property.recent')}
            </h2>
            <Link to="/browse" className="text-emerald-600 font-semibold hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recent.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-emerald-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-6">{t('home.ctaTitle')}</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            {t('home.ctaSubtitle')}
          </p>
          <Link 
            to="/register"
            className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-colors"
          >
            {t('home.ctaBtn')}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
