import React from 'react'
import Axios from 'axios'
import useAxios from 'axios-hooks'
import { Content } from 'antd/lib/layout/layout'
import Table, { ColumnsType } from 'antd/es/table'
import { Button, Space, Popconfirm, Modal, Input, Select } from 'antd'

import { IProduct } from '../../server/models/Products'

import PageLoader from '../components/PageLoader'
import EditableCell from '../components/EditableCell'
import AddProductForm, { IProductValues } from '../components/AddProductForm'

const ManageProducts: React.FC = () => {
  const [visible, setVisible] = React.useState(false)
  const [nameFilter, setNameFilter] = React.useState('')

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

  const dataSource = products
    .filter((p) => p.label.toLowerCase().includes(nameFilter.toLowerCase()))
    .map(({ label, url, id = '', category = '' }) => ({
      key: id,
      productId: id,
      label,
      url,
      delete: { id, category },
      category
    }))

  const changeCategory = (productId: string) => async (
    value: string
  ): Promise<void> => {
    try {
      await Axios.patch(`/api/products/${productId}/category`, {
        category: value
      })
    } catch (e) {
      console.error('Something went wrong:', e)
    }
  }

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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (value: string, record: any) => (
        <EditableCell
          currentValue={value}
          handleSave={changeCategory(record.productId)}
        >
          {value}
        </EditableCell>
      )
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
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 15
        }}
      >
        <Input
          placeholder="Filter by name"
          style={{ width: '250px', marginBottom: 15 }}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Button type="primary" onClick={() => setVisible(true)}>
          Add new item
        </Button>
      </Space>

      <Space style={{ display: 'flex', justifyContent: 'center' }}>
        <Table dataSource={dataSource} columns={columns} rowKey="productId" />
      </Space>
    </Content>
  )
}

export default ManageProducts
