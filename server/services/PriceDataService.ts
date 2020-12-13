import { Injectable } from '@decorators/di'

import PriceData, { IPriceData } from '../models/PriceData'

import { logVerbose } from '../logger'
import getNewestPrice from '../utility/getNewestPrice'

interface IFetchedData {
  formattedPrice: number
  formattedPreDiscount: number
}

@Injectable()
class PriceDataService {
  async saveProductPrice(
    productPriceData: IPriceData,
    fetchedData: IFetchedData
  ): Promise<void> {
    const { formattedPrice } = fetchedData

    const newestPrice = getNewestPrice(productPriceData?.prices)

    if (!productPriceData) {
      this.addNewDocument(productPriceData, fetchedData)
    } else if (newestPrice?.main === formattedPrice) {
      this.updatePriceDocument(productPriceData)
    } else {
      this.insertNewPrice(productPriceData, fetchedData)
    }
  }

  private async addNewDocument(
    productPriceData: IPriceData,
    { formattedPrice, formattedPreDiscount }: IFetchedData
  ): Promise<void> {
    logVerbose('Adding new PriceData object')

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
  }

  private async updatePriceDocument(
    productPriceData: IPriceData
  ): Promise<void> {
    logVerbose('Price is the same - skipping save')

    await PriceData.insertPrices(productPriceData)
  }

  private async insertNewPrice(
    productPriceData: IPriceData,
    { formattedPrice, formattedPreDiscount }: IFetchedData
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
