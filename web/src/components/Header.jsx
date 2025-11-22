import icon from '../image/icon.svg'
import { LoginButton } from './LoginButton'
import { useAuthContext } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function Header({ onMenuClick, onDarkModeToggle, isDarkMode, dbTotal = 0 }) {
  const { isAuthenticated } = useAuthContext()
  const { language, toggleLanguage, t } = useLanguage()
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src={icon} 
            alt="App icon" 
            className="w-8 h-8 select-none drop-shadow-sm"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {t('header.title')}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              {isAuthenticated && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {t('header.library')}
                </p>
              )}
              {dbTotal > 0 && (
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                  {t('header.catalog')}: {dbTotal.toLocaleString()} {t('header.games')}
                </p>
              )}
            </div>
          </div>
        </div>
                
        <div className="flex items-center gap-2">
          <LoginButton />
          
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('header.toggleLanguage')}
            title={language === 'es' ? 'English' : 'Español'}
          >
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {language.toUpperCase()}
            </span>
          </button>
          
          <button 
            onClick={onDarkModeToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('header.toggleDarkMode')}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('header.toggleFilters')}
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
