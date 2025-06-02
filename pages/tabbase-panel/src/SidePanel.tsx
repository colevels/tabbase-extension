import '@src/SidePanel.css'

import ChromeEventProvider from './components/ChromeEventProvider'
// import TabBase from './components/Features/TabBase/TabBase'
import TabBaseV2 from './components/Features/TabBaseNew/TabBase'
import Header from './components/Section/Header'
import { withErrorBoundary, withSuspense } from '@extension/shared'

const SidePanel = () => {
  console.log('SidePanel render')

  // return <div>A</div>
  return (
    <ChromeEventProvider>
      <div>
        <Header title="test" />
        <TabBaseV2 />
      </div>
    </ChromeEventProvider>
  )
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div>Error Occur</div>)
