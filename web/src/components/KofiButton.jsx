import { useLanguage } from '../context/LanguageContext'

export function KofiButton() {
  const { t } = useLanguage()
  return (
    <a 
      href="https://ko-fi.com/Z8Z81OW7UV" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 glass-tinted hover-glow bg-cyan-500/20 backdrop-blur-xl hover:bg-cyan-600/30 text-white rounded-lg transition-all font-medium text-sm border border-cyan-400/20"
      title={t('kofi.supportUs')}
    >
      <span>🍺</span>
      <span>{t('kofi.supportUs')}</span>
    </a>
  )
}

export default KofiButton
