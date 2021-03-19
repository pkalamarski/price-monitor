import Axios from 'axios'
import { Menu, Spin } from 'antd'
import Layout from 'antd/lib/layout'
import React, { useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'

import { IUser } from '../../server/models/Users'

const { Header } = Layout

interface IProps {
  user: IUser | undefined
  userLoading: boolean
}

const PageHeader: React.FC<IProps> = ({ user, userLoading }) => {
  const history = useHistory()
  const loc = useLocation()
  const [activeKey, setActiveKey] = useState('1')

  const logout = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e?.preventDefault()

    if (!user) return

    await Axios.post('/api/auth/logout')

    history?.push('/login')
  }

  useEffect(() => {
    setActiveKey(getActiveKey())
  }, [loc])

  const getActiveKey = (): string => {
    const path = loc.pathname

    switch (path) {
      case '/':
        return '1'
      case '/products':
        return '2'
      case '/mapping':
        return '3'
      case '/report':
        return '4'
      case '/login':
        return '5'
      default:
        return '1'
    }
  }

  return (
    <Header style={{ position: 'fixed', width: '100%', zIndex: 1 }}>
      <Menu theme="dark" mode="horizontal" selectedKeys={[activeKey]}>
        <Menu.Item key="1">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Item key="2">
          <Link to="/products">Manage products</Link>
        </Menu.Item>

        <Menu.Item key="3">
          <Link to="/mapping">Manage mapping</Link>
        </Menu.Item>

        <Menu.Item key="4">
          <Link to="/report">View report</Link>
        </Menu.Item>

        <Menu.Item key="5" style={{ float: 'right' }}>
          <Link to={!user ? '/login' : ''} onClick={logout}>
            {!userLoading ? <>{user?.fullName || 'Login'}</> : <Spin />}
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
  )
}

export default PageHeader
