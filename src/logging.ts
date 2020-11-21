import { sheets_v4 } from 'googleapis'
import { IPrice } from './sheetDataHandling'

type ReportRow = [string, string, number, number | string, number, string]

interface ICalculateDiffParams {
  start: Date
  end?: Date
}

const spreadsheetId = process.env.SPREADSHEET_ID

export const logAction = async (
  message: string,
  sheets: sheets_v4.Sheets,
  startDate: Date = null
) => {
  const timeElapsed = startDate
    ? ` [${calculateTimeDiff({ start: startDate })}ms]`
    : ''

  const values = [
    [formatDate(new Date()), message ? `${message}${timeElapsed}` : '']
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    requestBody: {
      values,
      range: 'Log!A1:B1'
    },
    valueInputOption: 'RAW'
  })
}

export const logMultiple = async (
  messages: string[] = [],
  sheets: sheets_v4.Sheets
) => {
  const date = formatDate(new Date())

  const values = messages.map((msg) => [date, msg || ''])

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    requestBody: {
      values,
      range: 'Log!A1:B1'
    },
    valueInputOption: 'RAW'
  })
}

export const generateReport = async (
  prices: IPrice[],
  sheets: sheets_v4.Sheets
) => {
  const start = new Date()
  const parsedDate = formatDate(start)

  const priceReport: ReportRow[] = prices
    .filter((item) => item.url !== '-')
    .map((item) => [
      item.name,
      item.url,
      item.preDiscount,
      item.price,
      item.time,
      parsedDate
    ])

  const values = [
    ['||', '||', '||', '||', '||', '||'],
    [`========== Detailed job report from ${parsedDate} ==========`],
    ...priceReport
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    requestBody: {
      values,
      range: `Report!A1:F1`
    },
    valueInputOption: 'RAW'
  })

  await logAction('[7/7] Generate report', sheets, start)
}

export const formatDate = (date: Date): string =>
  date?.toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw'
  })

export const calculateTimeDiff = ({
  start,
  end
}: ICalculateDiffParams): number =>
  (end?.getTime() || new Date().getTime()) - start.getTime()
