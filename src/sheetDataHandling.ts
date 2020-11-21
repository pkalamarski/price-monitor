import { sheets_v4 } from 'googleapis'

import { logAction } from './logging'

export interface IPrice {
  url: string
  price: number | string

  name?: string
  preDiscount?: number
  time?: number
}

export interface IMapping {
  host: string
  preDiscountSelector: string
  priceSelector: string
  useHTML: boolean
}

const spreadsheetId = process.env.SPREADSHEET_ID

export const getItemUrls = async (
  sheets: sheets_v4.Sheets
): Promise<string[]> => {
  const start = new Date()

  const {
    data: { values }
  } = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'B2:B100' })

  await logAction('[2/7] Get item URLs', sheets, start)

  return (values as any).flat()
}

export const writePrices = async (
  sheets: sheets_v4.Sheets,
  prices: IPrice[],
  columnName: string
) => {
  const start = new Date()

  const date = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric'
  })

  const values = [[date], ...prices.map((item) => [item.price])]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    requestBody: { values, range: `${columnName}1` },
    valueInputOption: 'RAW'
  })

  await logAction('[6/7] Save prices to spreadsheet', sheets, start)
}

export const getPageMapping = async (
  sheets: sheets_v4.Sheets
): Promise<IMapping[]> => {
  const {
    data: { values }
  } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Mapping!A2:D20'
  })

  const mapping = values.reduce((mapping, pageMapping) => {
    const [host, preDiscountSelector, priceSelector, useHTMLRaw] = pageMapping
    const useHTML = useHTMLRaw === 'TRUE'

    return [...mapping, { host, preDiscountSelector, priceSelector, useHTML }]
  }, [])

  return mapping
}
