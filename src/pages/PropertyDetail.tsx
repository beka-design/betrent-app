import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { Bed, Bath, MapPin, Phone, MessageCircle, Share2, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../constants';
import { cn } from '../lib/utils';
import CostCalculator from '../components/CostCalculator';
import { Calculator } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [property, setProperty] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProperty({ id: docSnap.id, ...data });
          
          // Fetch related
          const q = query(
            collection(db, 'properties'),
            where('subCity', '==', data.subCity),
            where('status', '==', 'approved'),
            limit(3)
          );
          const relatedSnap = await getDocs(q);
          setRelated(relatedSnap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() })));
        } else {
          // Fallback to mock data
          const mock = MOCK_PROPERTIES.find(p => p.id === id);
          if (mock) {
            setProperty(mock);
            setRelated(MOCK_PROPERTIES.filter(p => p.subCity === mock.subCity && p.id !== id));
          }
        }
      } catch (e) {
        console.error("Error fetching property:", e);
        // Fallback to mock data on error too
        const mock = MOCK_PROPERTIES.find(p => p.id === id);
        if (mock) {
          setProperty(mock);
          setRelated(MOCK_PROPERTIES.filter(p => p.subCity === mock.subCity && p.id !== id));
        }
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">{t('common.loading')}</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">{t('property.notFound')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{property.title || t('property.detailTitle')} | Bete</title>
        <meta name="description" content={property.description || t('property.detailDesc')} />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-lg bg-zinc-100 dark:bg-zinc-800">
              <img 
                src={property.images?.[0] || 'https://picsum.photos/seed/house/800/600'} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.images.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      // Swap main image
                      const newImages = [...property.images];
                      const [selected] = newImages.splice(idx, 1);
                      newImages.unshift(selected);
                      setProperty({ ...property, images: newImages });
                    }}
                    className={cn(
                      "aspect-square rounded-2xl overflow-hidden shadow-md border-2 transition-all cursor-pointer",
                      idx === 0 ? "border-emerald-500" : "border-transparent hover:border-emerald-200"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
            {property.images && property.images.length > 1 && (
              <p className="text-xs text-zinc-500 italic text-center">
                {t('detail.imageTip')}
              </p>
            )}
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">{property.title}</h1>
              <div className="flex items-center text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-5 h-5 mr-1" />
                {property.subCity}, {property.locationDetails}
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-8 border-y border-zinc-100 dark:border-zinc-800">
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{t('detail.price')}</div>
              <div className="text-xl font-bold text-emerald-600">{(property.price || 0).toLocaleString()} ETB</div>
            </div>
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{t('detail.bedrooms')}</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">{property.bedrooms || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{t('detail.bathrooms')}</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">{property.bathrooms || 0}</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">{t('detail.description')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t('detail.contactOwner')}</h3>
              <div className="space-y-4">
                <a
                  href={`tel:${property.phone || ''}`}
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-5 h-5" />
                  <span>{t('property.contactCall')}</span>
                </a>
                <a
                  href={`https://wa.me/${(property.phone || '').replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t('property.contactWhatsApp')}</span>
                </a>
              </div>
            </div>

            {/* cost of living. */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-600 rounded-lg text-white">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">{t('detail.costLivingTitle')}</h4>
                  <p className="text-xs text-zinc-500">{t('detail.costLivingSubtitle')}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('detail.costLivingDesc')}
              </p>
              <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full py-3 rounded-xl font-bold bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all shadow-sm"
              >
                {t('detail.calculateBtn')}
              </button>
            </div>
            {/* cost of living. */}

            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-bold mb-2 text-zinc-900 dark:text-white">{t('detail.safetyTips')}</h4>
              <ul className="text-sm text-zinc-500 dark:text-zinc-400 space-y-2 list-disc pl-4">
                <li>{t('detail.safetyTip1')}</li>
                <li>{t('detail.safetyTip2')}</li>
                <li>{t('detail.safetyTip3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">{t('detail.relatedTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* cost of living. */}
      <CostCalculator 
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        propertyPrice={property.price}
        propertyLocation={property.subCity}
      />
      {/* cost of living. */}
    </div>
  );
}
