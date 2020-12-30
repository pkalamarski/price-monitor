import useAxios from 'axios-hooks'
import React from 'react'

import PricePanel from '../components/PricePanel'

import { IProduct } from '../../server/models/Products'
import sortByName from '../../server/utility/sortByName'
import LoadingIndicator from '../components/LoadingIndicator'
import { IProductOrder } from '../../server/services/PriceDataService'

const Home = (): JSX.Element => {
  const [{ data: products, loading }] = useAxios<IProduct[]>('/api/products')
  const [
    { data: productOrder, loading: orderLoading }
  ] = useAxios<IProductOrder>('/api/product-order')

  if (loading || orderLoading || !products || !productOrder)
    return <LoadingIndicator />

  return (
    <>
      {products
        .sort(
          ({ id: idA }, { id: idB }): number =>
            productOrder[idA || ''] - productOrder[idB || '']
        )
        .map((p, i) => (
          <PricePanel key={i} product={p} />
        ))}
    </>
  )
}

export default Home
