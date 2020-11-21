const Axios = require("axios");
const { google } = require("googleapis");

const { checkPrices } = require("./dataHandling");
const { initializeAuth } = require("./authorize");
const { logAction, logMultiple, generateReport } = require("./logging");
const { getItemUrls, writePrices } = require("./sheetDataHandling");
const { addNewColumn, getNewColumnName } = require("./sheetSchemaHandling");

const {
  CHECK_PRICE_INTERVAL,
  CHECK_HEALTH_INTERVAL,
  SERVER_URL,
  VERSION,
} = process.env;

const initialize = async () => {
  const auth = initializeAuth();

  const sheets = google.sheets({ version: "v4", auth });

  await initMsg(sheets);

  await getPrices(sheets);

  setInterval(
    async () => await getPrices(sheets),
    Number(CHECK_PRICE_INTERVAL)
  );

  monitorHealth(sheets);
};

const getPrices = async (sheets) => {
  const startTime = new Date();

  await logMultiple([null, "JOB: Starting price check job"], sheets);

  const newColumnName = await getNewColumnName(sheets);

  const urls = await getItemUrls(sheets);

  await addNewColumn(sheets);

  const prices = await checkPrices(urls, sheets);

  await writePrices(sheets, prices, newColumnName);

  await generateReport(prices, sheets);

  const validUrls = urls.filter((url) => url !== "-");
  const elapsedSeconds = ((new Date() - startTime) / 1000).toFixed(1);
  const { high, avg, low } = calculateAverageTime(prices);

  await logMultiple(
    [
      `Time report: high: ${high}s, avg: ${avg}s, low: ${low}s`,
      `SUCCESS: ${validUrls.length} prices checked in ${elapsedSeconds} seconds`,
      null,
    ],
    sheets
  );
};

const initMsg = async (sheets) =>
  await logMultiple(
    [
      null,
      `============== price-monitor v${VERSION} ==============`,
      `CHECK_PRICE_INTERVAL: ${CHECK_PRICE_INTERVAL / 60 / 60 / 1000} hours`,
      `CHECK_HEALTH_INTERVAL: ${CHECK_HEALTH_INTERVAL / 60 / 1000} minutes`,
      null,
    ],
    sheets
  );

const monitorHealth = (sheets) =>
  setInterval(async () => {
    const start = new Date();
    const { data } = await Axios.get(SERVER_URL);
    await logAction(`Health check - ${data}`, sheets, start);
  }, Number(CHECK_HEALTH_INTERVAL));

const calculateAverageTime = (prices) => {
  const times = prices.map((p) => p.time).filter(Boolean);

  const high = times.sort((a, b) => b - a)[0];
  const avg = times.reduce((sum, t) => sum + t) / times.length;
  const low = times.sort((a, b) => a - b)[0];

  return { high: formatTime(high), avg: formatTime(avg), low: formatTime(low) };
};

const formatTime = (ms) => (ms / 1000).toFixed(2);

exports.initialize = initialize;
