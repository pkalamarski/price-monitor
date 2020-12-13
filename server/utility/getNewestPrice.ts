import { IPrice } from '../models/PriceData'

const getNewestPrice = (prices: IPrice[]): IPrice => {
  if (!prices?.length) return

  const sortedPrices = prices.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return sortedPrices[0]
}

export default getNewestPrice
