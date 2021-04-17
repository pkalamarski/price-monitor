import { IPrice } from '../models/price-monitor/PriceData'
import { sortByNewest } from './sortPrices'

const filterPrices = (prices: IPrice[]): IPrice[] => {
  if (prices.length <= 1) return prices

  const sortedPrices = prices.sort(sortByNewest)

  const uniquePrices = sortedPrices.reduce((allPrices, price, index, array) => {
    const previousPrice = array[index - 1]
    const prePreviousPrice = array[index - 2]

    const noPriceChange =
      previousPrice?.main === 0 && price.main === prePreviousPrice?.main

    if (price.main === 0 || noPriceChange) return allPrices

    return [...allPrices, price]
  }, [])

  return uniquePrices
}

export default filterPrices
