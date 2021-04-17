import PriceMonitorData from '../../databases/PriceMonitorData'
import BaseContainer, { IDocument } from './../BaseModel'

export interface IReport extends IDocument {
  date: Date | string
  numberOfProducts: number
  duration: number
  low: number
  avg: number
  high: number
  highProductId: string
}

const Report = new BaseContainer<IReport>('Report', PriceMonitorData)

export default Report
