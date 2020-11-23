import { sheets_v4 } from 'googleapis'

import { logAction } from './loggingHandler'

export interface IItem {
  id: number
  index: number
  customName: string
  url: string
  price: number | string
}

export interface IPrice {
  itemId: number
  url: string
  oldPrice: number | string
  newPrice: number | string

  name?: string
  preDiscount?: number | string
  time?: number
}

export interface IMapping {
  host: string
  preDiscountSelector: string
  priceSelector: string
  useHTML: boolean
}

const spreadsheetId = process.env.SPREADSHEET_ID

export const getItems = async (
  sheets: sheets_v4.Sheets,
  lastColumnName: string
): Promise<IItem[]> => {
  const start = new Date()

  const {
    data: { valueRanges }
  } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: ['A2:C100', `${lastColumnName}2:${lastColumnName}100`],
    valueRenderOption: 'FORMULA'
  })

  const itemsData = valueRanges[0].values?.map((row, i) => ({
    id: row[0],
    index: i,
    customName: row[1],
    url: row[2]
  }))

  const priceData = valueRanges[1].values?.map((row, i) => ({
    index: i,
    price: row[0]
  }))

  const items = itemsData.map(
    (item): IItem => {
      const priceMatch = priceData?.find(
        (price) => price.index === item.index
      ) || {
        price: null
      }

      return { ...item, ...priceMatch }
    }
  )

  await logAction('[2/7] Get items data', sheets, start)

  return items
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

  const values = [[date], ...prices.map((item) => [item.newPrice])]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${columnName}1`,
    requestBody: { values },
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
