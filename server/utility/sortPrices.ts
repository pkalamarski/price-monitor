import { IPrice } from '../models/price-monitor/PriceData'

export const getNewestPrice = (prices: IPrice[]): IPrice => {
  if (!prices?.length) return

  const sortedPrices = prices.sort(sortByNewest)

  return sortedPrices[0]
}

export const sortByNewest = (a: IPrice, b: IPrice): number =>
  new Date(b.date).getTime() - new Date(a.date).getTime()

export const sortByOldest = (a: IPrice, b: IPrice): number =>
  new Date(a.date).getTime() - new Date(b.date).getTime()
