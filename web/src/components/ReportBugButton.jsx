import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function ReportBugButton({ repo = 'RGVylar/steam-priority-picker' }) {
  const { t } = useLanguage()
  const handleClick = () => {
    try {
      const title = encodeURIComponent(t('report.title'))
      const body = encodeURIComponent(t('report.body'))
      const url = `https://github.com/${repo}/issues/new?title=${title}&body=${body}`
      window.open(url, '_blank')
    } catch (e) {
      // Fallback: open repo issues page
      window.open(`https://github.com/${repo}/issues`, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 glass-tinted hover-glow bg-red-500/20 backdrop-blur-xl hover:bg-red-600/30 text-white rounded-lg transition-all font-medium text-sm border border-red-400/20"
      aria-label="Report a bug"
      title="Report a bug"
    >
      <span>🐞</span>
      <span>{t('report.button')}</span>
    </button>
  )
}
