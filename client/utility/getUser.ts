import useAxios from 'axios-hooks'
import { IUser } from '../../server/models/Users'

interface IGetUser {
  user?: IUser
  loading: boolean
  refetch?: Function
}

const getUser = (): IGetUser => {
  try {
    const [{ data: user, loading }, refetch] = useAxios({
      method: 'GET',
      url: '/api/user'
    })

    return { user, loading, refetch }
  } catch (e) {
    return { loading: false }
  }
}

export default getUser
