import PriceMonitorData from '../database'
import BaseContainer, { IDocument } from './BaseModel'

export interface IUser extends IDocument {
  fullName: string
  username: string
  hash: string
  role: string
  lastLogin: Date | string
}

const Users = new BaseContainer<IUser>('Users', PriceMonitorData)

export default Users
