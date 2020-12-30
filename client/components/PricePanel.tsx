import React from 'react'
import useAxios from 'axios-hooks'
import { Divider, Skeleton, Space, Typography } from 'antd'

import { IProduct } from '../../server/models/Products'
import { IPriceData } from '../../server/models/PriceData'
import { shortDate } from '../../server/utility/formatDate'
import filterPrices from '../../server/utility/filterPrices'
import { sortByNewest } from '../../server/utility/sortPrices'

const { Title, Link, Text, Paragraph } = Typography

interface IProps {
  product: IProduct
}

const PricePanel = ({ product }: IProps): JSX.Element => {
  const [{ data: priceData, loading }] = useAxios<IPriceData>({
    url: '/api/product-prices',
    params: { productId: product.id }
  })

  const sortedPrices = priceData ? priceData.prices.sort(sortByNewest) : []

  const filteredPrices = priceData ? filterPrices(sortedPrices) : []
  const currency = priceData?.currency || ''
  const currentlyUnavailable = sortedPrices[0]?.main === 0

  return (
    <Paragraph>
      <Space>
        <Title level={5}>
          <Link href={product.url}>{product.label}</Link>
        </Title>
      </Space>
      <div>
        <Skeleton
          loading={loading}
          active
          title={false}
          paragraph={{ rows: 2 }}
        >
          {currentlyUnavailable && (
            <Space
              style={{
                minWidth: 100,
                fontWeight: 800
              }}
              direction="vertical"
            >
              <Text>Not available</Text>

              <Text>{shortDate(new Date(sortedPrices[0].date))}</Text>
            </Space>
          )}
          {filteredPrices
            .map((price, i) => (
              <Space
                key={i}
                style={{
                  minWidth: 100,
                  fontWeight: i === 0 ? 600 : 'normal'
                }}
                direction="vertical"
              >
                <Text>
                  {price.main} {currency}
                </Text>

                <Text>{shortDate(new Date(price.date))}</Text>
              </Space>
            ))
            .slice(0, 5)}
        </Skeleton>
      </div>
      <Divider />
    </Paragraph>
  )
}

export default PricePanel
