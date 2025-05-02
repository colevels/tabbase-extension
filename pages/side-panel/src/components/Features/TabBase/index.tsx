import React from 'react'
import { MultipleContainers } from './TabBase'

const TabSpace = () => {
  return (
    <div>
      <MultipleContainers
        scrollable
        containerStyle={{
          maxHeight: '100px',
        }}
        getItemStyles={({ value }) => {
          console.log('get item styles')
          if (value === 'A1') {
            return {
              height: '100px',
              backgroundColor: 'red',
            }
          }

          return {}
        }}
        itemCount={10}
      />
    </div>
  )
}

export default TabSpace
