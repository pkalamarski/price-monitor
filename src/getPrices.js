const Axios = require("axios");
const { google } = require("googleapis");

const { getItemUrls, writePrices, logAction } = require("./sheetDataHandling");
const { addNewColumn, getNewColumnName } = require("./sheetSchemaHandling");
const { checkPrices } = require("./dataHandling");

const {
  CHECK_PRICE_INTERVAL,
  CHECK_HEALTH_INTERVAL,
  SERVER_URL,
  VERSION,
} = process.env;

const initialize = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });

  await initMsg(sheets);

  await monitorPrices(sheets);

  setInterval(
    async () => await monitorPrices(sheets),
    Number(CHECK_PRICE_INTERVAL)
  );

  monitorHealth(sheets);
};

const monitorPrices = async (sheets) => {
  await logAction(null, sheets);
  await logAction("JOB: Price checking job initiated", sheets);

  const startTime = new Date();

  const [newColumnName, urls] = await Promise.all([
    getNewColumnName(sheets),
    getItemUrls(sheets),
  ]);

  const [prices] = await Promise.all([
    checkPrices(urls, sheets),
    addNewColumn(sheets),
  ]);

  await writePrices(sheets, prices, newColumnName);

  const elapsedSeconds = (new Date() - startTime) / 1000;

  await logAction(
    `SUCCESS: ${urls.length} prices checked in ${elapsedSeconds.toFixed(
      1
    )} seconds`,
    sheets
  );
  await logAction(null, sheets);
};

const initMsg = async (sheets) => {
  await logAction(null, sheets);
  await logAction(
    `============== price-monitor v${VERSION} ==============`,
    sheets
  );
  await logAction(
    `CHECK_PRICE_INTERVAL: ${CHECK_PRICE_INTERVAL / 60 / 60 / 1000} hours`,
    sheets
  );
  await logAction(
    `CHECK_HEALTH_INTERVAL: ${CHECK_HEALTH_INTERVAL / 60 / 1000} minutes`,
    sheets
  );
  await logAction(null, sheets);
};

const monitorHealth = (sheets) => {
  setInterval(async () => {
    const { data } = await Axios.get(SERVER_URL);
    await logAction(`Health check - ${data}`, sheets);
  }, Number(CHECK_HEALTH_INTERVAL));
};

exports.initialize = initialize;
