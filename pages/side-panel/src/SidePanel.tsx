import '@src/SidePanel.css'
import { withErrorBoundary, withSuspense } from '@extension/shared'

import Header from './components/Section/Header'
import ChromeEventProvider from './components/ChromeEventProvider'
import Tabs from './components/Common/Tabs'
import TabBase from './components/Features/TabBase'

const SidePanel = () => {
  return (
    <ChromeEventProvider>
      <div>
        <Header title="test" />
        <TabBase />
        <Tabs />
      </div>
    </ChromeEventProvider>
  )
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>)
