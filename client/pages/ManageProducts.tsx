import React from 'react'
import Axios from 'axios'
import useAxios from 'axios-hooks'
import { Button, Space, Popconfirm, Modal } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'

import { IProduct } from '../../server/models/Products'

import PageLoader from '../components/PageLoader'
import AddProductForm, { IProductValues } from '../components/AddProductForm'
import { Content } from 'antd/lib/layout/layout'

const ManageProducts: React.FC = () => {
  const [visible, setVisible] = React.useState(false)

  const [{ data: products, loading }, refetch] = useAxios<IProduct[]>({
    url: '/api/products/'
  })

  if (loading || !products) return <PageLoader />

  const deleteProduct = async (productId: string, category: string) => {
    await Axios.delete('/api/products', {
      data: {
        productId,
        category
      }
    })

    refetch()
  }

  const dataSource = products.map(({ label, url, id = '', category = '' }) => ({
    productId: id,
    label,
    url,
    delete: { id, category }
  }))

  const columns: ColumnsType<{
    label: string
    productId: string
    url: string
    delete: { id: string; category: string }
  }> = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId'
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => <a href={url}>{url}</a>
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'delete',
      render: ({ id, category }) => (
        <Popconfirm
          title="Are you sure to delete this product?"
          onConfirm={() => deleteProduct(id, category)}
          okText="Yes"
          cancelText="No"
        >
          <Button>Delete</Button>
        </Popconfirm>
      )
    }
  ]

  const addNewItem = async (values: IProductValues) => {
    try {
      await Axios.post('/api/products', values)
    } catch {
      // ignore error
    }
    setVisible(false)
    refetch()
  }

  return (
    <Content
      style={{
        padding: '30px 90px',
        marginTop: 64,
        height: '100%',
        width: '100%'
      }}
    >
      <Modal title="Title" visible={visible} footer={null}>
        <AddProductForm onSubmit={addNewItem} />
      </Modal>

      <Space
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}
      >
        <Button type="primary" onClick={() => setVisible(true)}>
          Add new item
        </Button>
      </Space>

      <Space style={{ display: 'flex', justifyContent: 'center' }}>
        <Table dataSource={dataSource} columns={columns} rowKey="id" />
      </Space>
    </Content>
  )
}

export default ManageProducts
