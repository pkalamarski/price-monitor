import { google } from 'googleapis'

import getPrices from './getPrices'
import { logAction } from './handlers/loggingHandler'
import initializeAuth from './authorize'

const forceCheck = async () => {
  const auth = initializeAuth()

  const sheets = google.sheets({ version: 'v4', auth })

  await logAction('Check triggered manually', sheets)
  await getPrices(sheets)
}

export default forceCheck
