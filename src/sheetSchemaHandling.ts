import { intToExcelCol } from 'excel-column-name'

import { logAction } from './logging'

const spreadsheetId = process.env.SPREADSHEET_ID

export const getNewColumnName = async (sheets) => {
  const start = new Date()

  const {
    data: { sheets: spreadsheetSheets }
  } = await sheets.spreadsheets.get({
    spreadsheetId
  })

  await logAction(`[1/7] Get new column name`, sheets, start)

  return intToExcelCol(
    spreadsheetSheets[0].properties.gridProperties.columnCount + 1
  )
}

export const addNewColumn = async (sheets) => {
  const start = new Date()

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          appendDimension: {
            dimension: 'COLUMNS',
            length: 1
          }
        }
      ]
    }
  })

  await logAction('[3/7] Add new data column', sheets, start)
}
