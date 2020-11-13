const excelColumnName = require("excel-column-name");
const { logAction } = require("./sheetDataHandling");

const spreadsheetId = process.env.SPREADSHEET_ID;

const getNewColumnName = async (sheets) => {
  await logAction("Getting new column name", sheets);

  const {
    data: { sheets: spreadsheetSheets },
  } = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  return excelColumnName.intToExcelCol(
    spreadsheetSheets[0].properties.gridProperties.columnCount + 1
  );
};

const addNewColumn = async (sheets) => {
  await logAction("Adding new data column", sheets);

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
};

exports.getNewColumnName = getNewColumnName;
exports.addNewColumn = addNewColumn;
