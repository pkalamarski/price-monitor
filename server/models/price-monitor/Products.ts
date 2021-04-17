import PriceMonitorData from '../../databases/PriceMonitorData'
import BaseContainer, { IDocument } from './../BaseModel'

export interface IProduct extends IDocument {
  url: string
  label: string
  category: string
}

const Products = new BaseContainer<IProduct>('Products', PriceMonitorData)

export default Products
