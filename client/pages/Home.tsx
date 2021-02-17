import useAxios from 'axios-hooks'
import React from 'react'

import PricePanel from '../components/PricePanel'
import PageLoader from '../components/PageLoader'

import { IProduct } from '../../server/models/Products'
import { IProductOrder } from '../../server/services/PriceDataService'
import { Content } from 'antd/lib/layout/layout'

const Home: React.FC = () => {
  const [{ data: products, loading }] = useAxios<IProduct[]>('/api/products/')
  const [
    { data: productOrder, loading: orderLoading }
  ] = useAxios<IProductOrder>('/api/products/order')

  if (loading || orderLoading || !products || !productOrder)
    return <PageLoader />

  return (
    <Content
      style={{
        padding: '30px 300px',
        marginTop: 64,
        height: '100%',
        width: '100%'
      }}
    >
      {products
        .sort(
          ({ id: idA }, { id: idB }): number =>
            productOrder[idA || ''] - productOrder[idB || '']
        )
        .map((p, i) => (
          <PricePanel key={i} product={p} />
        ))}
    </Content>
  )
}

export default Home
