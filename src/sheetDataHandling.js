const { logAction } = require("./logging");

const spreadsheetId = process.env.SPREADSHEET_ID;

const getItemUrls = async (sheets) => {
  const start = new Date();

  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({ spreadsheetId, range: "B2:B100" });

  await logAction("[2/7] Get item URLs", sheets, start);

  return values.flat();
};

const writePrices = async (sheets, prices, columnName) => {
  const start = new Date();

  const date = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
  });

  await Promise.all([
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${columnName}1`,
      resource: {
        values: [[date]],
      },
      valueInputOption: "RAW",
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${columnName}2`,
      resource: { values: prices.map((item) => [item.price]) },
      valueInputOption: "RAW",
    }),
  ]);

  await logAction("[6/7] Save prices to spreadsheet", sheets, start);
};

const getPageMapping = async (sheets) => {
  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Mapping!A2:D20",
  });

  const mapping = values.reduce((mapping, pageMapping) => {
    const [host, preDiscountSelector, priceSelector, useHTMLRaw] = pageMapping;
    const useHTML = useHTMLRaw === "TRUE";

    return [...mapping, { host, preDiscountSelector, priceSelector, useHTML }];
  }, []);

  return mapping;
};

exports.getItemUrls = getItemUrls;
exports.writePrices = writePrices;
exports.getPageMapping = getPageMapping;
