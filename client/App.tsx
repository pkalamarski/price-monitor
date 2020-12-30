import React from 'react'
import { hot } from 'react-hot-loader'
import { Layout, Menu } from 'antd'

import 'antd/dist/antd.css'

import Home from './pages/Home'

const { Header, Content } = Layout

const PriceMonitor = () => (
  <Layout className="layout" style={{ minHeight: '100%' }}>
    <Header style={{ position: 'fixed', width: '100%', zIndex: 1 }}>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        <Menu.Item key="1">Home</Menu.Item>
        <Menu.Item key="2">Manage items</Menu.Item>
        <Menu.Item key="3">Manage mapping</Menu.Item>
      </Menu>
    </Header>
    <Content
      style={{
        padding: '30px 300px',
        marginTop: 64,
        height: '100%',
        width: '100%'
      }}
    >
      <Home />
    </Content>
  </Layout>
)

export default hot(module)(PriceMonitor)
