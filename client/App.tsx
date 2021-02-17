import useAxios from 'axios-hooks'
import { hot } from 'react-hot-loader'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'

import { Layout } from 'antd'
import 'antd/dist/antd.css'

import PageHeader from './layout/PageHeader'

import Routes from './Routes'

import { IUser } from '../server/models/Users'

const { Content } = Layout

const PriceMonitor = () => {
  const history = useHistory()

  const [loginPathChange, setLoginPathChange] = useState(false)

  const [{ data: user, loading: userLoading }, refetch] = useAxios<IUser>({
    method: 'GET',
    url: '/api/user'
  })

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
      <PageHeader user={user} userLoading={userLoading} />
      <Routes />
    </>
  )
}

export default hot(module)(PriceMonitor)
