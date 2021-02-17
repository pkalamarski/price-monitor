import React from 'react'
import useAxios from 'axios-hooks'
import Axios from 'axios'
import { Button, Modal, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { ISiteMapping } from '../../server/models/SiteMapping'

import PageLoader from '../components/PageLoader'
import AddMappingForm, { IMappingValues } from '../components/AddMappingForm'
import { Content } from 'antd/lib/layout/layout'

const ManageMapping: React.FC = () => {
  const [visible, setVisible] = React.useState(false)

  const [{ data: mapping, loading }, refetch] = useAxios<ISiteMapping[]>({
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
      key: 'usePuppeteer',
      render: (val: boolean) => (val ? 'true' : 'false')
    },
    {
      title: 'isMetaTag?',
      dataIndex: 'isMetaTag',
      key: 'isMetaTag',
      render: (val: boolean) => (val ? 'true' : 'false')
    }
  ]

  const showModal = () => {
    setVisible(true)
  }

  const addNewItem = async (values: IMappingValues) => {
    try {
      await Axios.post('/api/mapping', values)
    } catch {
      // ignore error
    }
    setVisible(false)
    refetch()
  }

  return (
    <Content
      style={{
        padding: '30px',
        marginTop: 64,
        height: '100%',
        width: '100%'
      }}
    >
      <Modal title="Title" visible={visible} footer={null}>
        <AddMappingForm onSubmit={addNewItem} />
      </Modal>

      <Space
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}
      >
        <Button type="primary" onClick={showModal}>
          Add new item
        </Button>
      </Space>

      <Space style={{ display: 'flex', justifyContent: 'center' }}>
        <Table dataSource={dataSource} columns={columns} rowKey="id" />
      </Space>
    </Content>
  )
}

export default ManageMapping
