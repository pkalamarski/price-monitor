import { sheets_v4 } from 'googleapis'
import { intToExcelCol } from 'excel-column-name'

import { logAction } from './logging'

interface IColumnNames {
  lastColumnName: string
  newColumnName: string
}

const spreadsheetId = process.env.SPREADSHEET_ID

export const getColumnNames = async (
  sheets: sheets_v4.Sheets
): Promise<IColumnNames> => {
  const start = new Date()

  const {
    data: { sheets: spreadsheetSheets }
  } = await sheets.spreadsheets.get({
    spreadsheetId
  })

  await logAction(`[1/7] Get new column name`, sheets, start)

  const lastColumn = spreadsheetSheets[0].properties.gridProperties.columnCount

  return {
    lastColumnName: intToExcelCol(lastColumn),
    newColumnName: intToExcelCol(lastColumn + 1)
  }
}

export const addNewColumn = async (sheets: sheets_v4.Sheets) => {
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

  await logAction('[5/7] Add new data column', sheets, start)
}
