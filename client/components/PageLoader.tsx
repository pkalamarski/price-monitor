import { Space, Spin } from 'antd'

import React from 'react'

const PageLoader: React.FC = () => (
  <Space
    style={{
      width: '100%',
      height: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Spin size="large" />
  </Space>
)

export default PageLoader
