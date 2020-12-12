import useAxios from 'axios-hooks'
import React from 'react'

import PricePanel from '../components/PricePanel'

const Index = () => {
  const [{ data: products, loading }] = useAxios('/api/products')
  if (loading) return <div>Loading</div>

  return (
    <main className="container">
      {products.map((p) => (
        <PricePanel product={p} />
      ))}
    </main>
  )
}

export default Index
