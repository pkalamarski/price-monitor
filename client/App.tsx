import Axios from 'axios'
import { hot } from 'react-hot-loader'
import React, { useEffect, useState } from 'react'
import { Switch, Route, Link, useHistory } from 'react-router-dom'

import { Layout, Menu, Spin } from 'antd'
import 'antd/dist/antd.css'

import Home from './pages/Home'
import Login from './pages/Login'
import getUser from './utility/getUser'

const { Header, Content } = Layout

const PriceMonitor = () => {
  const history = useHistory()

  const [loginPathChange, setLoginPathChange] = useState(false)

  const { user, loading: userLoading, refetch } = getUser()

  const logout = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()

    if (!user) return

    await Axios.post('/api/auth/logout')

    history.push('/login')
  }

  history.listen(() => {
    const shouldRefetch =
      document.referrer.includes('/login') ||
      document.location.href.includes('/login')

    setLoginPathChange(shouldRefetch)
  })

  useEffect(() => {
    refetch && refetch()
  }, [loginPathChange])

  return (
    <>
      <Header style={{ position: 'fixed', width: '100%', zIndex: 1 }}>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
            <Link to="/">Home</Link>
          </Menu.Item>

          <Menu.Item key="2">
            <Link to="/products">Manage products</Link>
          </Menu.Item>

          <Menu.Item key="3">
            <Link to="/mapping">Manage mapping</Link>
          </Menu.Item>

          <Menu.Item key="4" style={{ float: 'right' }}>
            <Link to={!user ? '/login' : ''} onClick={logout}>
              {!userLoading ? <>{user?.fullName || 'Login'}</> : <Spin />}
            </Link>
          </Menu.Item>
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
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
        </Switch>
      </Content>
    </>
  )
}

export default hot(module)(PriceMonitor)
