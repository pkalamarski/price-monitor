import { Injectable } from '@decorators/di'

import PriceData, { IPriceData } from '../models/PriceData'

import { logVerbose } from '../logger'
import getNewestPrice from '../utility/getNewestPrice'

interface IFetchedData {
  mainPrice: number
  preDiscountPrice: number
}

@Injectable()
class PriceDataService {
  async saveProductPrice(
    productId: string,
    productPriceData: IPriceData,
    fetchedData: IFetchedData
  ): Promise<void> {
    const { mainPrice: formattedPrice } = fetchedData

    const newestPrice = getNewestPrice(productPriceData?.prices)

    if (!productPriceData) {
      this.addNewDocument(productId, fetchedData)
    } else if (newestPrice?.main === formattedPrice) {
      this.updatePriceDocument(productPriceData)
    } else {
      this.insertNewPrice(productPriceData, fetchedData)
    }
  }

  private async addNewDocument(
    productId: string,
    { mainPrice: mainPrice, preDiscountPrice: preDiscountPrice }: IFetchedData
  ): Promise<void> {
    logVerbose('Adding new PriceData object')

    await PriceData.create({
      currency: 'PLN',
      productId: productId,
      prices: [
        {
          main: mainPrice,
          preDiscount: preDiscountPrice,
          date: new Date()
        }
      ],
      createdDate: new Date(),
      updatedDate: new Date()
    })
  }

  private async updatePriceDocument(
    productPriceData: IPriceData
  ): Promise<void> {
    logVerbose('Price is the same - skipping save')

    await PriceData.insertPrices(productPriceData)
  }

  private async insertNewPrice(
    productPriceData: IPriceData,
    {
      mainPrice: formattedPrice,
      preDiscountPrice: formattedPreDiscount
    }: IFetchedData
  ): Promise<void> {
    logVerbose('Inserting new price')

    await PriceData.insertPrices(productPriceData, [
      {
        main: formattedPrice,
        preDiscount: formattedPreDiscount,
        date: new Date()
      }
    ])
  }
}

export default PriceDataService
