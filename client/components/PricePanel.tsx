import React from 'react'
import useAxios from 'axios-hooks'

import { IProduct } from '../../server/models/Products'
import { IPriceData } from '../../server/models/PriceData'
import { shortDate } from '../../server/utility/formatDate'
import filterPrices from '../../server/utility/filterPrices'
import { sortByNewest } from '../../server/utility/sortPrices'

interface IProps {
  product: IProduct
}

const PricePanel = ({ product }: IProps): JSX.Element => {
  const [{ data: priceData }] = useAxios<IPriceData>({
    url: '/api/productPrices',
    params: { productId: product.id }
  })

  const hostName = new URL(product.url).host.split('www.').join('')

  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ display: 'flex' }}>
        <h3 style={{ marginRight: 10 }}>{product.label}</h3>
        <h5 style={{ fontStyle: 'italic' }}>
          <a href={product.url}>{hostName}</a>
        </h5>
      </span>
      <div style={{ display: 'flex' }}>
        {priceData &&
          filterPrices(priceData.prices)
            .sort(sortByNewest)
            .map((price, i) => (
              <span
                style={{ flexFlow: 'column', marginRight: 15, minWidth: 150 }}
                key={i}
              >
                <p>
                  {price.main} {priceData.currency}
                </p>

                <p>{shortDate(new Date(price.date))}</p>
              </span>
            ))
            .slice(0, 5)}
      </div>
      <hr />
    </div>
  )
}

export default PricePanel
