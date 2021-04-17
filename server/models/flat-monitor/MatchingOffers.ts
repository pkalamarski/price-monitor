import FlatMonitorDB from '../../databases/FlatMonitorData'
import BaseContainer, { IDocument } from '../BaseModel'

export interface IMatchingOffer extends IDocument {
  url: string
  title: string
  price: number
  keyword: string
  roomCount: number
}

const MatchingOffers = new BaseContainer<IMatchingOffer>(
  'MatchingOffers',
  FlatMonitorDB
)

export default MatchingOffers
