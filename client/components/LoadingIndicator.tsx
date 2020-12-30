import { Space, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import React from 'react'

const LoadingIndicator = () => {
  const loadingIndicator = <LoadingOutlined style={{ fontSize: 48 }} spin />

  return (
    <Space
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Spin indicator={loadingIndicator} />
    </Space>
  )
}

export default LoadingIndicator
