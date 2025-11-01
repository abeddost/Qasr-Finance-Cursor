import { LayoutDashboard, Lightbulb, Moon, Sun } from 'lucide-react'

interface SidebarProps {
  currentView: 'dashboard' | 'insights'
  onViewChange: (view: 'dashboard' | 'insights') => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

const Sidebar = ({ currentView, onViewChange, darkMode, onDarkModeToggle }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0">
      {/* Branding */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          Qasr Finance
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Financial Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onDarkModeToggle}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          {darkMode ? (
            <>
              <Sun className="h-5 w-5" />
              <span className="font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              <span className="font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Sidebar



