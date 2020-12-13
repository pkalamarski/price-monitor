import PriceMonitorData from '../database'
import BaseContainer, { IDocument } from './BaseModel'

export interface ISiteMapping extends IDocument {
  host: string
  imageSelector: string
  nameSelector: string
  preDiscountSelector?: string
  priceSelector: string
}

const SiteMapping = new BaseContainer<ISiteMapping>(
  'SiteMapping',
  PriceMonitorData
)

export default SiteMapping