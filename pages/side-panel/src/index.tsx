import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import '@src/index.css'

import { store } from '@extension/shared'
import SidePanel from '@src/SidePanel'

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)
  root.render(
    <Provider store={store}>
      <SidePanel />
    </Provider>,
  )
}

init()
