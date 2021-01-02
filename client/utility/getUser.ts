import { AxiosRequestConfig, AxiosPromise } from 'axios'
import useAxios, { RefetchOptions } from 'axios-hooks'
import { IUser } from '../../server/models/Users'

interface IGetUser {
  user?: IUser
  loading: boolean
  refetch?: (
    config?: AxiosRequestConfig | undefined,
    options?: RefetchOptions | undefined
  ) => AxiosPromise<IUser>
}

const getUser = (): IGetUser => {
  try {
    const [{ data: user, loading }, refetch] = useAxios<IUser>({
      method: 'GET',
      url: '/api/user'
    })

    return { user, loading, refetch }
  } catch (e) {
    return { loading: false }
  }
}

export default getUser
