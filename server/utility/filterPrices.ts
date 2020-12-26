import { IPrice } from '../models/PriceData'

const filterPrices = (prices: IPrice[]): IPrice[] => {
  const sortedPrices = prices.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

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
