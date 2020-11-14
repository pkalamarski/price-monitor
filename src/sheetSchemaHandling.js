const excelColumnName = require("excel-column-name");
const { logAction } = require("./sheetDataHandling");

const spreadsheetId = process.env.SPREADSHEET_ID;

const getNewColumnName = async (sheets) => {
  const start = new Date();

  const {
    data: { sheets: spreadsheetSheets },
  } = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  await logAction(`[1/6] Get new column name`, sheets, start);

  return excelColumnName.intToExcelCol(
    spreadsheetSheets[0].properties.gridProperties.columnCount + 1
  );
};

const addNewColumn = async (sheets) => {
  const start = new Date();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          appendDimension: {
            dimension: "COLUMNS",
            length: 1,
          },
        },
      ],
    },
  });

  await logAction("[3/6] Add new data column", sheets, start);
};

exports.getNewColumnName = getNewColumnName;
exports.addNewColumn = addNewColumn;
