import { IProduct } from '~server/models/Products'

const sortByName = (a: IProduct, b: IProduct): number => {
  if (a.label > b.label) {
    return 1
  } else if (a.label < b.label) {
    return -1
  } else {
    return 0
  }
}

export default sortByName
