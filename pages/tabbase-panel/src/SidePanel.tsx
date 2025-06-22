import React from 'react'
import styled from 'styled-components'

import '@src/SidePanel.css'

import { useAppDispatch } from '@extension/tabbase-shared'
import { onActGetExample } from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'

import { withErrorBoundary, withSuspense } from '@extension/shared'

import ProfileContainer from './components/ProfileContainer'
import ChromeContainer from './components/ChromeContainer'

import Header from './components/Header'
import Body from './components/Body'
import Error from './components/Error'

const StyledContainer = styled.div`
  padding: 10px;
`

const SidePanel = () => {
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(onActGetExample())
  }, [dispatch])

  return (
    <ChromeContainer>
      <ProfileContainer>
        <StyledContainer>
          <Header />
          <Body />
        </StyledContainer>
      </ProfileContainer>
    </ChromeContainer>
  )
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), Error)
