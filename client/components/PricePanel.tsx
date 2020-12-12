import React from 'react'
import useAxios from 'axios-hooks'

import { IProduct } from '../../server/models/Products'
import { IPriceData } from '../../server/models/PriceData'

interface IProps {
  product: IProduct
}

const PricePanel = ({ product }: IProps) => {
  const [{ data: priceData, loading }] = useAxios<IPriceData>({
    url: '/api/productPrices',
    params: { productId: product.id }
  })

  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ display: 'flex' }}>
        <h3 style={{ marginRight: 10 }}>{product.label}</h3>
        <h5 style={{ fontStyle: 'italic' }}>
          <a href={product.url}>
            {new URL(product.url).host.split('www.').join('')}
          </a>
        </h5>
      </span>
      <span>Last updated: {priceData?.updatedDate?.toLocaleString()}</span>
      <div style={{ display: 'flex' }}>
        {priceData &&
          priceData.prices
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((price, i) => (
              <span style={{ flexFlow: 'column', marginRight: 15 }} key={i}>
                <p>
                  Price: {price.main} {priceData.currency}
                </p>
                {i === 0 && <p>Current price</p>}
                {i > 0 && <p>Date: {price.date.toLocaleString()}</p>}
              </span>
            ))}
      </div>
      <hr />
    </div>
  )
}

export default PricePanel
