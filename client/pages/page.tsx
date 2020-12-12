import useAxios from 'axios-hooks'
import React from 'react'

import PricePanel from '../components/PricePanel'

import { IProduct } from '../../server/models/Products'

const Index = () => {
  const [{ data: products, loading }] = useAxios<IProduct[]>('/api/products')

  if (loading || !products) return <div>Loading</div>

  return (
    <main className="container">
      {products.map((p, i) => (
        <PricePanel key={i} product={p} />
      ))}
    </main>
  )
}

export default Index
