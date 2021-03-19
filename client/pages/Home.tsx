import React from 'react'
import useAxios from 'axios-hooks'
import { Input, Select, Space, Table, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'

import PageLoader from '../components/PageLoader'

import { IProduct } from '../../server/models/Products'
import { IPrice, IPriceData } from '../../server/models/PriceData'

import { shortDate } from '../../server/utility/formatDate'
import { sortByNewest } from '../../server/utility/sortPrices'
import { IProductOrder } from '../../server/services/PriceDataService'

const { Title, Link, Text } = Typography

const { Option } = Select

const Home: React.FC = () => {
  const [{ data: products, loading }] = useAxios<IProduct[]>('/api/products/')
  const [{ data: priceData, loading: priceDataLoading }] = useAxios<
    IPriceData[]
  >('/api/products/all-prices')
  const [
    { data: productOrder, loading: orderLoading }
  ] = useAxios<IProductOrder>('/api/products/order')

  const categories = [...new Set(products?.map((p) => p.category))]

  const [nameFilter, setNameFilter] = React.useState<string>('')
  const [filteredCategories, filterCategories] = React.useState<string[]>([])

  if (loading || orderLoading || !products || !productOrder || priceDataLoading)
    return <PageLoader />

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, product) => (
        <Title level={5}>
          <Link href={product.url}>{value}</Link>
        </Title>
      )
    },
    {
      title: 'Current price',
      dataIndex: 'price',
      key: 'price',
      render: (price: IPrice) => (
        <div style={{ lineHeight: 2, fontWeight: 600 }}>
          <div>{shortDate(new Date(price?.date))}</div>
          <div>
            {price && price.main !== 0 ? `${price.main} PLN` : 'Not available'}
          </div>
        </div>
      )
    },
    {
      title: 'Previous price',
      dataIndex: 'prevPrice',
      key: 'prevPrice',
      render: (price: IPrice) => (
        <div style={{ lineHeight: 2 }}>
          <div>{price && shortDate(new Date(price?.date))}</div>
          <div>
            {price && price.main !== 0 ? `${price.main} PLN` : 'Not available'}
          </div>
        </div>
      )
    },
    { title: 'Category', dataIndex: 'category', key: 'category' }
  ]

  const dataSource = products
    .filter((p) => p.label.toLowerCase().includes(nameFilter.toLowerCase()))
    .filter((p) =>
      filteredCategories.length ? filteredCategories.includes(p.category) : true
    )
    .sort(
      ({ id: idA }, { id: idB }): number =>
        productOrder[idA || ''] - productOrder[idB || '']
    )
    .map((product, i) => {
      const productPriceData = priceData?.find(
        (pD) => pD.productId === product.id
      )

      const sortedPrices = productPriceData?.prices.sort(sortByNewest)

      return {
        key: i,
        name: product.label,
        url: product.url,
        shop: new URL(product.url).host,
        category: capitalizeFirstLetter(product.category.split('-').join(' ')),
        price: sortedPrices ? sortedPrices[0] : null,
        prevPrice: sortedPrices ? sortedPrices[1] : null,
        sortedPrices
      }
    })

  return (
    <Content
      style={{
        padding: '30px 250px',
        marginTop: 64,
        height: '100%',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 15
        }}
      >
        <Input
          placeholder="Filter by name"
          style={{ width: '45%' }}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Select
          mode="multiple"
          allowClear
          style={{ width: '45%' }}
          placeholder="Filter by category"
          defaultValue={[]}
          onChange={filterCategories}
        >
          {categories.sort().map((cat) => (
            <Option key={cat} value={cat}>
              {capitalizeFirstLetter(cat.split('-').join(' '))}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (row: any) => (
            <Space>
              {row.sortedPrices.slice(0, 9).map((price, i) => (
                <Space
                  key={i}
                  style={{
                    minWidth: 100,
                    fontWeight: i === 0 ? 600 : 'normal'
                  }}
                  direction="vertical"
                >
                  <Text>{shortDate(new Date(price?.date))}</Text>
                  <Text>
                    {price && price.main !== 0
                      ? `${price.main} PLN`
                      : 'Not available'}
                  </Text>
                </Space>
              ))}
            </Space>
          )
        }}
        dataSource={dataSource}
      />
    </Content>
  )
}

export default Home

const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1)
