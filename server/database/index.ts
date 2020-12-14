import { CosmosClient } from '@azure/cosmos'

import { logInfo } from '../logger'

const endpoint = process.env.DB_ENDPOINT
const key = process.env.DB_ACCESS_KEY
const Client = new CosmosClient({ endpoint, key })

const PriceMonitorData = Client.database(process.env.DB_NAME)
logInfo(`🚀 Connected to ${process.env.DB_NAME} database`)

export default PriceMonitorData
