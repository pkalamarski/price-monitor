const spreadsheetId = process.env.SPREADSHEET_ID;

const getItemUrls = async (sheets) => {
  await logAction("Getting item URLs", sheets);

  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({ spreadsheetId, range: "B2:B100" });

  return values.flat();
};

const writePrices = async (sheets, prices, columnName) => {
  await logAction("Saving prices to spreadsheet", sheets);

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
};

const getPageMapping = async (sheets) => {
  await logAction("Getting page mapping", sheets);

  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Mapping!A2:C20",
  });

  const mapping = values.reduce((mapping, pageMapping) => {
    const [host, selector, useHTMLRaw] = pageMapping;
    const useHTML = useHTMLRaw === "TRUE";

    return [...mapping, { host, selector, useHTML }];
  }, []);

  return mapping;
};

const logAction = async (message, sheets) =>
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Log!A1:B1`,
    resource: {
      values: [
        [
          new Date().toLocaleString("en-GB", { timeZone: "Europe/Warsaw" }),
          message || "",
        ],
      ],
    },
    valueInputOption: "RAW",
  });

exports.getItemUrls = getItemUrls;
exports.writePrices = writePrices;
exports.getPageMapping = getPageMapping;
exports.logAction = logAction;
