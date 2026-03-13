import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ADDIS_SUB_CITIES, PROPERTY_TYPES } from '../lib/utils';
import { Upload, X, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export default function ListProperty() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [propertyCount, setPropertyCount] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [cookieError, setCookieError] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    subCity: ADDIS_SUB_CITIES[0],
    locationDetails: '',
    propertyType: PROPERTY_TYPES[0],
    bedrooms: '1',
    bathrooms: '1',
    furnished: 'No',
    phone: profile?.phone || ''
  });

  React.useEffect(() => {
    const checkLimit = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'properties'),
          where('ownerId', '==', user.uid)
        );
        const snap = await getDocs(q);
        setPropertyCount(snap.size);
      } catch (err) {
        console.error("Error checking property limit:", err);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (propertyCount >= 5) {
      alert(t('list.limitReachedDesc'));
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'properties'), {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        images,
        ownerId: user.uid,
        status: 'pending',
        isFeatured: false,
        createdAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 5 images per property.");
      return;
    }

    setLoading(true);
    const filesToUpload = Array.from(selectedFiles).slice(0, remainingSlots);
    const uploadFormData = new FormData();
    
    filesToUpload.forEach((file: File) => {
      uploadFormData.append('images', file);
    });

    console.log(`Starting upload for ${filesToUpload.length} files. Current images: ${images.length}`);

    try {
      setCookieError(false);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      const contentType = res.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Received non-JSON response:', text);
        
        // Detect AI Studio cookie check / authentication redirect
        if (text.includes('Cookie check') || text.includes('Action required to load your app')) {
          setCookieError(true);
          throw new Error('Your browser is blocking a required security cookie.');
        }
        
        throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(data.details || data.error || `Upload failed with status ${res.status}`);
      }

      if (data.urls && Array.isArray(data.urls)) {
        console.log("Upload successful, received URLs:", data.urls);
        setImages(prev => [...prev, ...data.urls]);
      } else {
        console.warn("Upload response successful but no URLs received", data);
        alert("Upload seemed to work but no images were returned. Please try again.");
      }
    } catch (err: any) {
      console.error('Upload failed error:', err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      // Reset input value to allow re-uploading same file if needed
      if (e.target) e.target.value = '';
    }
  };

  const setMainImage = (index: number) => {
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
  };

  if (checkingLimit) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (propertyCount >= 5) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-amber-50 dark:bg-amber-950/30 p-8 rounded-3xl border border-amber-200 dark:border-amber-800">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-4">{t('list.limitReachedTitle')}</h2>
          <p className="text-amber-700 dark:text-amber-500 mb-8">
            {t('list.limitReachedDesc')}
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors"
          >
            {t('list.goDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('list.title')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">{t('list.formTitle')}</label>
            <input
              type="text"
              required
              placeholder={t('list.formTitlePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">{t('list.formDesc')}</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formPrice')}</label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formSubCity')}</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.subCity}
              onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
            >
              {ADDIS_SUB_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formType')}</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formFurnished')}</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.furnished}
              onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
            >
              <option value="No">{t('filters.no')}</option>
              <option value="Yes">{t('filters.yes')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formBedrooms')}</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('list.formBathrooms')}</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">{t('list.formLocation')}</label>
            <input
              type="text"
              required
              placeholder={t('list.formLocationPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={formData.locationDetails}
              onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('list.formImages')}
            </label>
            
            {cookieError && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-400">
                <p className="font-bold mb-1">{t('list.cookieErrorTitle')}</p>
                <p>{t('list.cookieErrorDesc')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {images.map((url, idx) => (
                <div key={idx} className={cn(
                  "relative aspect-square rounded-xl overflow-hidden group border-2 transition-all",
                  idx === 0 ? "border-emerald-500 shadow-lg" : "border-transparent"
                )}>
                  <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setMainImage(idx)}
                        className="p-2 bg-white text-zinc-900 rounded-full hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Set as Main Image"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Image Badge */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center shadow-md">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t('list.mainBadge')}
                    </div>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-600 hover:border-emerald-600 transition-all cursor-pointer bg-zinc-50 dark:bg-zinc-950">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">{t('list.addImage')}</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            {images.length > 0 && (
              <p className="text-xs text-zinc-500 mt-2 italic">
                {t('list.imageTip')}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? t('list.submitting') : t('list.submitBtn')}
        </button>
      </form>
    </div>
  );
}
