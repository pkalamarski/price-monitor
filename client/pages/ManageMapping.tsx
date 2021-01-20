import React from 'react'
import useAxios from 'axios-hooks'
import { Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { ISiteMapping } from '../../server/models/SiteMapping'

import PageLoader from '../components/PageLoader'

const ManageMapping: React.FC = () => {
  const [{ data: mapping, loading }] = useAxios<ISiteMapping[]>({
    url: '/api/mapping/'
  })

  if (loading || !mapping) return <PageLoader />

  const dataSource = mapping.map(
    ({
      host,
      priceSelector,
      usePuppeteer = false,
      isMetaTag = false,
      id = ''
    }) => ({
      id,
      host,
      priceSelector,
      usePuppeteer,
      isMetaTag
    })
  )

  const columns: ColumnsType<{
    id: string
    host: string
    priceSelector: string
    usePuppeteer: boolean
    isMetaTag: boolean
  }> = [
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host'
    },
    {
      title: 'Price Selector',
      dataIndex: 'priceSelector',
      key: 'priceSelector'
    },
    {
      title: 'Use Puppeteer?',
      dataIndex: 'usePuppeteer',
      key: 'usePuppeteer'
    },
    {
      title: 'isMetaTag?',
      dataIndex: 'isMetaTag',
      key: 'isMetaTag'
    }
  ]

  return (
    <Space style={{ display: 'flex', justifyContent: 'center' }}>
      <Table dataSource={dataSource} columns={columns} rowKey="id" />
    </Space>
  )
}

export default ManageMapping
