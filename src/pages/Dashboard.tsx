import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { PlusCircle, Home, Clock, CheckCircle, XCircle, Search, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'properties'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setMyListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchMyListings();
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>;

  const isRenter = profile?.role === 'renter';
  const dashboardTitle = profile?.role === 'renter' ? t('dashboard.renterTitle') : 
                        profile?.role === 'owner' ? t('dashboard.ownerTitle') : 
                        t('dashboard.brokerTitle');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {t('dashboard.welcome', { name: profile?.fullName })}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 capitalize">{dashboardTitle}</p>
        </div>
        {!isRenter && (
          <Link
            to="/list-property"
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('dashboard.listNew')}</span>
          </Link>
        )}
        {isRenter && (
          <Link
            to="/browse"
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>{t('dashboard.findHome')}</span>
          </Link>
        )}
      </motion.div>

      {isRenter ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <Search className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('dashboard.startSearching')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('dashboard.startSearchingDesc')}</p>
              <Link to="/browse" className="text-emerald-600 font-bold hover:underline inline-flex items-center">
                {t('dashboard.browseNow')} <PlusCircle className="w-4 h-4 ml-1 rotate-45" />
              </Link>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <Heart className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('dashboard.savedHomes')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('dashboard.savedHomesDesc')}</p>
              <button className="text-zinc-400 font-bold cursor-not-allowed inline-flex items-center">
                {t('dashboard.comingSoon')}
              </button>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <MapPin className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('dashboard.areaGuides')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('dashboard.areaGuidesDesc')}</p>
              <button className="text-zinc-400 font-bold cursor-not-allowed inline-flex items-center">
                {t('dashboard.comingSoon')}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8">{t('dashboard.recommended')}</h2>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-3xl p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 mb-4">{t('dashboard.completeProfile')}</p>
              <Link to="/browse" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-xl font-bold inline-block">
                {t('dashboard.exploreListings')}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Home className="w-8 h-8 text-emerald-600" />
                <span className="text-2xl font-bold">{myListings.length}</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('dashboard.totalListings')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
                <span className="text-2xl font-bold">
                  {myListings.filter(l => l.status === 'pending').length}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('dashboard.pendingApproval')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl font-bold">
                  {myListings.filter(l => l.status === 'approved').length}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('dashboard.activeListings')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
                <span className="text-2xl font-bold">
                  {myListings.filter(l => l.status === 'rejected').length}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('dashboard.rejected')}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8">{t('dashboard.myListings')}</h2>
          {myListings.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 mb-6">{t('dashboard.noListings')}</p>
              <Link to="/list-property" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                {t('dashboard.createFirst')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myListings.map(property => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg ${
                    property.status === 'approved' ? 'bg-emerald-500 text-white' :
                    property.status === 'pending' ? 'bg-amber-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {t(`dashboard.status.${property.status}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
