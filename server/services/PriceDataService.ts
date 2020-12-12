import { Injectable } from '@decorators/di'
import PriceData, { IPrice, IPriceData } from '../models/PriceData'

@Injectable()
class PriceDataService {
  getNewestPrice(prices: IPrice[]): IPrice {
    if (!prices?.length) return

    const sortedPrices = prices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return sortedPrices[0]
  }

  async saveProductPrice(
    productPriceData: IPriceData,
    fetchedData: { formattedPrice: number; formattedPreDiscount: number }
  ) {
    const { formattedPrice, formattedPreDiscount } = fetchedData

    const newestPrice = this.getNewestPrice(productPriceData?.prices)

    if (!productPriceData) {
      await PriceData.create({
        currency: 'PLN',
        productId: productPriceData.productId,
        prices: [
          {
            main: formattedPrice,
            preDiscount: formattedPreDiscount,
            date: new Date()
          }
        ],
        createdDate: new Date(),
        updatedDate: new Date()
      })
    } else if (newestPrice?.main === formattedPrice) {
      console.log(`${newestPrice?.main} === ${formattedPrice}`)
      await PriceData.insertPrices(productPriceData)
    } else {
      console.log('Inserting new price')
      await PriceData.insertPrices(productPriceData, [
        {
          main: formattedPrice,
          preDiscount: formattedPreDiscount,
          date: new Date()
        }
      ])
    }
  }
}

export default PriceDataService
