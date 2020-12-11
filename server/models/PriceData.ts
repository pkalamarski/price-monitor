import { Database } from '@azure/cosmos'
import PriceMonitorData from '../database'
import BaseContainer, { IDocument } from './BaseModel'

export interface IPrice {
  main: number
  preDiscount: number
  date: Date
}

export interface IPriceData extends IDocument {
  productId: string
  currency: string
  prices: IPrice[]
}

class PriceDataBase extends BaseContainer<IPriceData> {
  constructor(id: string, database: Database) {
    super(id, database)
  }

  async getByProductId(productId: string): Promise<IPriceData> {
    const data = await this.query(
      `SELECT * FROM ${this.containerId} p WHERE p.productId = @productId`,
      [{ name: '@productId', value: productId }]
    )

    return data[0]
  }

  async insertPrices(productPriceData: IPriceData, prices?: IPrice[]) {
    const { id, currency } = productPriceData

    const { resource: product } = await this.container
      .item(id, currency)
      .read<IPriceData>()

    this.upsert({
      ...product,
      prices: prices?.length ? [...product.prices, ...prices] : product.prices
    })
  }
}

const PriceData = new PriceDataBase('PriceData', PriceMonitorData)

export default PriceData
