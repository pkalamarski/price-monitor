import React from 'react'

import { Button, Space, Table, Popconfirm } from 'antd'
import useAxios from 'axios-hooks'
import { IProduct } from '../../server/models/Products'
import { ColumnsType } from 'antd/lib/table'
import Axios from 'axios'

const ManageProducts: React.FC = () => {
  const [{ data: products, loading }, refetch] = useAxios<IProduct[]>({
    url: '/api/products/'
  })

  if (loading || !products) return <>loading</>

  const deleteProduct = async (productId: string, category: string) => {
    await Axios.delete('/api/products', {
      data: {
        productId,
        category
      }
    })

    refetch()
  }

  const dataSource = products.map(({ label, url, id, category }) => ({
    label,
    url,
    edit: { id: id || '', category: category || '' },
    delete: { id: id || '', category: category || '' }
  }))

  const columns: ColumnsType<{
    label: string
    url: string
    edit: { id: string; category: string }
    delete: { id: string; category: string }
  }> = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => <a href={url}>{url}</a>
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'edit'
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

  return (
    <Space style={{ display: 'flex', justifyContent: 'center' }}>
      <Table dataSource={dataSource} columns={columns} />
    </Space>
  )
}

export default ManageProducts
