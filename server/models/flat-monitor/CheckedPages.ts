import FlatMonitorDB from '../../databases/FlatMonitorData'
import BaseContainer, { IDocument } from '../BaseModel'

export interface ICheckedPages extends IDocument {
  checkedUrls: string[]
}

const CheckedPages = new BaseContainer<ICheckedPages>(
  'CheckedPages',
  FlatMonitorDB
)

export default CheckedPages
