const spreadsheetId = process.env.SPREADSHEET_ID;

const getItemUrls = async (sheets) => {
  const start = new Date();

  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({ spreadsheetId, range: "B2:B100" });

  await logAction("[2/6] Get item URLs", sheets, start);

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

  await logAction("[6/6] Save prices to spreadsheet", sheets, start);
};

const getPageMapping = async (sheets) => {
  const start = new Date();

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

  await logAction("[4/6] Get page mapping", sheets, start);

  return mapping;
};

const logAction = async (message, sheets, startDate = null) => {
  const timeElapsed = startDate ? ` [${new Date() - startDate}ms]` : "";

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Log!A1:B1`,
    resource: {
      values: [
        [
          new Date().toLocaleString("en-GB", { timeZone: "Europe/Warsaw" }),
          message ? `${message}${timeElapsed}` : "",
        ],
      ],
    },
    valueInputOption: "RAW",
  });
};

const logMultiple = async (messages = [], sheets) => {
  const date = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
  });

  const values = messages.map((msg) => [date, msg || ""]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Log!A1:B1`,
    resource: {
      values,
    },
    valueInputOption: "RAW",
  });
};

exports.getItemUrls = getItemUrls;
exports.writePrices = writePrices;
exports.getPageMapping = getPageMapping;
exports.logAction = logAction;
exports.logMultiple = logMultiple;
