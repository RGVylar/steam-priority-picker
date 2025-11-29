import React from 'react'

export default function ReportBugButton({ repo = 'RGVylar/steam-priority-picker' }) {
  const handleClick = () => {
    try {
      const title = encodeURIComponent('[Bug] Describe the problem')
      const body = encodeURIComponent(`**Describe the bug**:\n\n**Steps to reproduce**:\n1. \n2. \n3. \n\n**Expected behavior**:\n\n**Additional information**:\n\n---\nUser Agent: ${navigator.userAgent}\nURL: ${window.location.href}`)
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
      <span className="text-base">🐞</span>
      <span>Report</span>
    </button>
  )
}
