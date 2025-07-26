import React from 'react'
import styled from 'styled-components'
import { ReactFlowProvider } from '@xyflow/react'

import '@src/SidePanel.css'

import { useAppDispatch } from '@extension/tabbase-shared'
import { onActGetExample } from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'

import { withErrorBoundary, withSuspense } from '@extension/shared'

import Example from './components/Example'
import ProfileContainer from './components/ProfileContainer'
import ChromeContainer from './components/ChromeContainer'

import Header from './components/Header'
import Body from './components/Body'
import Error from './components/Error'

const StyledContainer = styled.div`
  padding: 0px;
  width: 100vw;
  height: 100vh;
`

const SidePanel = () => {
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(onActGetExample())
  }, [dispatch])

  return (
    <ChromeContainer>
      <ReactFlowProvider>
        <ProfileContainer>
          <StyledContainer>
            <Example />
            {/* <Header /> */}
            {/* <Body /> */}
          </StyledContainer>
        </ProfileContainer>
      </ReactFlowProvider>
    </ChromeContainer>
  )
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), Error)
