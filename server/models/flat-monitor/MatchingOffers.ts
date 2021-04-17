import FlatMonitorDB from '../../databases/FlatMonitorData'
import BaseContainer, { IDocument } from '../BaseModel'

export interface IActiveOffer extends IDocument {
  url: string
  title: string
  price: number
  keyword: string
  roomCount: number
}

const ActiveOffers = new BaseContainer<IActiveOffer>(
  'ActiveOffers',
  FlatMonitorDB
)

export default ActiveOffers
