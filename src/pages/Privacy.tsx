import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  
  const sections = [
    {
      icon: Eye,
      title: t('privacy.section1Title'),
      content: t('privacy.section1Desc')
    },
    {
      icon: Lock,
      title: t('privacy.section2Title'),
      content: t('privacy.section2Desc')
    },
    {
      icon: Shield,
      title: t('privacy.section3Title'),
      content: t('privacy.section3Desc')
    },
    {
      icon: FileText,
      title: t('privacy.section4Title'),
      content: t('privacy.section4Desc')
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            {t('privacy.title').split(' ')[0]} <span className="text-emerald-600">{t('privacy.title').split(' ')[1]}</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('privacy.lastUpdated')}</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                {section.content}
              </p>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-emerald-600 text-white p-10 rounded-[40px] shadow-xl shadow-emerald-600/20"
          >
            <h2 className="text-2xl font-bold mb-4">{t('privacy.contactTitle')}</h2>
            <p className="mb-6 opacity-90 leading-relaxed">
              {t('privacy.contactDesc')}
            </p>
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-100 transition-colors">
              {t('privacy.contactBtn')}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
