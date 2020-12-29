import useAxios from 'axios-hooks'
import React from 'react'

import PricePanel from '../components/PricePanel'

import { IProduct } from '../../server/models/Products'

const Home = (): JSX.Element => {
  const [{ data: products, loading }] = useAxios<IProduct[]>('/api/products')

  if (loading || !products) return <div>Loading</div>

  return (
    <>
      {products.map((p, i) => (
        <PricePanel key={i} product={p} />
      ))}
    </>
  )
}

export default Home
