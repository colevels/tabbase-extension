import type React from 'react'

const Error: React.FC = () => {
  return (
    <div style={{ color: 'red', padding: '10px', border: '1px solid red', backgroundColor: '#ffe6e6' }}>
      <h2>Error</h2>
      {/* <p>{message}</p> */}
    </div>
  )
}

export default Error
