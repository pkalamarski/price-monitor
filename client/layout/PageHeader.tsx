import { Menu, Layout, Spin } from 'antd'
import Axios from 'axios'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { IUser } from '~server/models/Users'

const { Header } = Layout

interface IProps {
  user: IUser | undefined
  userLoading: boolean
}

const PageHeader: React.FC<IProps> = ({ user, userLoading }) => {
  const history = useHistory()

  const logout = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()

    if (!user) return

    await Axios.post('/api/auth/logout')

    history.push('/login')
  }

  return (
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
