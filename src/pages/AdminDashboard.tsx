import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Trash2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, 'properties'));
      const snap = await getDocs(q);
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    if (profile?.role === 'admin') {
      fetchListings();
    }
  }, [profile]);

  const handleStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'properties', id), { status });
    setListings(listings.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleFeatured = async (id: string, isFeatured: boolean) => {
    await updateDoc(doc(db, 'properties', id), { isFeatured });
    setListings(listings.map(l => l.id === id ? { ...l, isFeatured } : l));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      await deleteDoc(doc(db, 'properties', id));
      setListings(listings.filter(l => l.id !== id));
    }
  };

  if (profile?.role !== 'admin') return <div className="p-20 text-center">{t('admin.accessDenied')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">{t('admin.title')}</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('admin.property')}</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('admin.images')}</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('admin.owner')}</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('admin.status')}</th>
              <th className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {listings.map(l => (
              <tr key={l.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{l.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{l.subCity} • {l.price} ETB</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {l.images?.slice(0, 3).map((img: string, i: number) => (
                      <img 
                        key={i} 
                        src={img} 
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    {l.images?.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-2 ring-white dark:ring-zinc-900 text-[10px] font-bold">
                        +{l.images.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">{l.ownerId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    l.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {t(`dashboard.status.${l.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {l.status !== 'approved' && (
                      <button onClick={() => handleStatus(l.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {l.status !== 'rejected' && (
                      <button onClick={() => handleStatus(l.id, 'rejected')} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleFeatured(l.id, !l.isFeatured)} 
                      className={`p-2 rounded-lg ${l.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-zinc-400 hover:bg-zinc-100'}`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
