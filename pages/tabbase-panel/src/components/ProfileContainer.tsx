import { useAppDispatch, useAppSelector } from '@extension/tabbase-shared'
import { onActGetOptions, onActGetProfile } from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'
import React from 'react'

interface Props {
  children: React.ReactNode
}

const ProfileContainer: React.FC<Props> = props => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(state => state.tab.profile)

  React.useEffect(() => {
    dispatch(onActGetProfile())
    dispatch(onActGetOptions())
  }, [dispatch])

  if (profile) {
    return <div>{props.children}</div>
  }

  return <div>NEED LOGIN</div>
}

export default ProfileContainer
