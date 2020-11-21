const spreadsheetId = process.env.SPREADSHEET_ID;

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

const generateReport = async (prices, sheets) => {
  const start = new Date();
  const parsedDate = start.toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
  });

  const priceReport = prices
    .filter((item) => item.url !== "-")
    .map((item) => [
      item.name,
      item.url,
      item.preDiscount,
      item.price,
      item.time,
      parsedDate,
    ]);

  const fullReport = [
    ["||", "||", "||", "||", "||", "||"],
    [`========== Detailed job report from ${parsedDate} ==========`],
    ...priceReport,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Report!A1:F1`,
    resource: {
      values: fullReport,
    },
    valueInputOption: "RAW",
  });

  await logAction("[7/7] Generate report", sheets, start);
};

exports.logAction = logAction;
exports.logMultiple = logMultiple;
exports.generateReport = generateReport;
