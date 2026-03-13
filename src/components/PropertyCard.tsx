import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bed, Bath, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';

const PropertyCard: React.FC<{ property: any }> = ({ property }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images && property.images.length > 0 ? property.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {property.isFeatured && (
          <div className="absolute top-4 left-4 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-amber-950" />
            {t('property.featuredBadge')}
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
          {property.price.toLocaleString()} {t('property.perMonth')}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {property.subCity}
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-zinc-600 dark:text-zinc-400">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center text-zinc-600 dark:text-zinc-400">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
            {property.propertyType}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
