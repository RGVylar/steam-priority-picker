import { useLanguage } from '../context/LanguageContext'

export function KofiButton() {
  const { t } = useLanguage()
  return (
    <a 
      href="https://ko-fi.com/Z8Z81OW7UV" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-16 right-4 flex items-center gap-2 px-4 py-2 glass hover-glow bg-cyan-500/50 backdrop-blur-xl hover:bg-cyan-600/60 text-white rounded-lg transition-all font-medium text-sm z-40 border border-cyan-400/30"
      title={t('kofi.supportUs')}
    >
      <span>🍺</span>
      <span>{t('kofi.supportUs')}</span>
    </a>
  )
}

export default KofiButton
