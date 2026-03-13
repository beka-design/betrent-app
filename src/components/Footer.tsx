import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-500">
              Bete
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-sm">
              {t('hero.subtitle')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-6">
                {t('footer.about')}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/about" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {t('about.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {t('contact.title')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-6">
                {t('common.legal') || 'Legal'}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/privacy" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {t('footer.terms')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-6">
                {t('contact.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm">{t('contact.officeDesc')}</span>
                </li>
                <li className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm">+251 901705907</span>
                </li>
                <li className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm">hello@bete.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            © {new Date().getFullYear()} Bete PropTech. {t('common.rightsReserved') || 'All rights reserved.'}
          </p>
          <div className="flex items-center space-x-6 text-sm text-zinc-400 dark:text-zinc-500">
            <span>{t('common.madeWith') || 'Made with ❤️ in Addis'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
