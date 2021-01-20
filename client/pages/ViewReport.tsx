import React from 'react'
import useAxios from 'axios-hooks'
import { Space, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'

import { IReport } from '../../server/models/Report'
import { toLocaleString } from '../../server/utility/formatDate'
import { IProduct } from '../../server/models/Products'
import PageLoader from '../components/PageLoader'

const ViewReport: React.FC = () => {
  const [{ data: reportData, loading }] = useAxios<IReport[]>({
    url: '/api/report/'
  })

  const [{ data: products, loading: productLoading }] = useAxios<IProduct[]>({
    url: '/api/products/'
  })

  if (loading || !reportData || !products || productLoading)
    return <PageLoader />

  const addMsSuffix = (val: string): string => `${val} ms`

  const columns: ColumnsType<IReport> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (val: string) => toLocaleString(new Date(val))
    },
    {
      title: 'Fastest fetch time',
      dataIndex: 'low',
      key: 'low',
      render: addMsSuffix
    },
    {
      title: 'Average fetch time',
      dataIndex: 'avg',
      key: 'avg',
      render: (val: string) => addMsSuffix(Number(val).toFixed())
    },
    {
      title: 'Slowest fetch time',
      dataIndex: 'high',
      key: 'high',
      render: addMsSuffix
    },
    {
      title: 'Slowest product',
      dataIndex: 'highProductId',
      key: 'highProductId',
      render: (id: string) => {
        const product = products.find((p) => p.id === id)

        if (!product) return 'Item removed'

        return <a href={product.url}>{product.label}</a>
      }
    },
    {
      title: 'Job duration',
      dataIndex: 'duration',
      key: 'duration',
      render: addMsSuffix
    },
    {
      title: 'Number of products',
      dataIndex: 'numberOfProducts',
      key: 'numberOfProducts'
    }
  ]

  const sortedReport = reportData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Space style={{ display: 'flex', justifyContent: 'center' }}>
      <Table dataSource={sortedReport} columns={columns} rowKey="id" />
    </Space>
  )
}

export default ViewReport
