import icon from '../image/icon.svg'
import { LoginButton } from './LoginButton'
import { useAuthContext } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function Header({ onMenuClick, onDarkModeToggle, isDarkMode, onGlassModeToggle, isGlassMode, dbTotal = 0, userTotal = 0, onRefresh, isRefreshing = false }) {
  const { isAuthenticated } = useAuthContext()
  const { language, toggleLanguage, t } = useLanguage()
  return (
    <header className="glass-dark float-elevated sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top row: Logo + Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src={icon} 
              alt="App icon" 
              className="w-7 h-7 lg:w-8 lg:h-8 select-none drop-shadow-sm"
            />
            <h1 className="text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {t('header.title')}
            </h1>
          </div>
                  
          <div className="flex items-center gap-1 lg:gap-2">
            <LoginButton />
            
            {isAuthenticated && onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('header.refresh')}
                title={t('header.refresh')}
              >
                <svg 
                  className={`w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-200 ${isRefreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={toggleLanguage}
              className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('header.toggleLanguage')}
              title={language === 'es' ? 'English' : 'Español'}
            >
              <span className="text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-200">
                {language.toUpperCase()}
              </span>
            </button>
            
            <button 
              onClick={onDarkModeToggle}
              className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('header.toggleDarkMode')}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button 
              onClick={onGlassModeToggle}
              className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle Glass Mode"
              title={isGlassMode ? 'Disable Glass Effect' : 'Enable Glass Effect'}
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isGlassMode ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
              </svg>
            </button>

            <button 
              onClick={onMenuClick}
              className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('header.toggleFilters')}
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom row: Stats (only when authenticated) */}
        {isAuthenticated && (userTotal > 0 || dbTotal > 0) && (
          <div className="flex items-center gap-3 lg:gap-4 mt-2 flex-wrap">
            {userTotal > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {t('header.library')}: {userTotal.toLocaleString()} {t('header.games')}
              </p>
            )}
            {dbTotal > 0 && (
              <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                {t('header.catalog')}: {dbTotal.toLocaleString()} {t('header.games')}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
