import '@src/SidePanel.css'
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared'
import { exampleThemeStorage } from '@extension/storage'
import { ToggleButton } from '@extension/ui'
import { t } from '@extension/i18n'

import ChromeEventProvider from './components/ChromeEventProvider'
import Tabs from './components/Tabs'
import PinTabs from './components/PinTabs'
import TabBase from './components/TabBase'

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage)
  const isLight = theme === 'light'

  return (
    <ChromeEventProvider>
      <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
        <div>Space</div>
        <TabBase />
        <PinTabs />
        <Tabs />
        <div>Tab Box</div>
        <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </header>
      </div>
    </ChromeEventProvider>
  )
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>)
