const got = require("got");
const cheerio = require("cheerio");

const {
  logAction,
  getPageMapping,
  logMultiple,
} = require("./sheetDataHandling");

const checkPrices = async (urls, sheets) => {
  const start = new Date();

  const mappingStart = new Date();
  const mapping = await getPageMapping(sheets);
  await logAction("[4/6] Get page mapping", sheets, mappingStart);

  await logAction("[5/6] Get item prices process started", sheets);

  let prices = [];

  const checkpoints = [0.25, 0.5, 0.75, 1].map((p) =>
    Math.round(p * urls.length)
  );

  for (url of urls) {
    const index = urls.indexOf(url);

    if (checkpoints.includes(index)) {
      await logAction(
        `Checkpoint: ${(
          (index / urls.length) *
          100
        ).toFixed()}% prices checked`,
        sheets
      );
    }

    if (url === "-") {
      prices.push({
        url: "-",
        price: " ",
      });
      continue;
    }

    const itemStart = new Date();

    try {
      const page = await got(url);
      const $ = cheerio.load(page.body);

      const { host } = new URL(url);

      const strippedHost = host.replace("www.", "");

      const siteMapping = mapping.find((map) => map.host === strippedHost);

      if (!siteMapping) {
        await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets);
        prices.push({
          url,
          price: "?",
        });
        continue;
      }

      const { selector, useHTML } = siteMapping;

      const rawPrice = useHTML ? $(selector).html() : $(selector).text();

      prices.push({
        url,
        price: parsePrice(rawPrice || "-"),
        time: new Date() - itemStart,
      });
    } catch (e) {
      await logMultiple(
        [
          `ERROR: Cannot fetch price after ${(
            (new Date() - itemStart) /
            1000
          ).toFixed()} seconds`,
          `ERROR: URL: ${url}`,
          `ERROR: Name: ${e.name}`,
          `ERROR: Code ${e.code}`,
        ],
        sheets
      );
      console.error(e);
      prices.push({
        url,
        price: "?",
        time: new Date() - itemStart,
      });
    }
  }

  await logAction("[5/6] Get item prices process finished", sheets, start);

  return prices;
};

const parsePrice = (price) =>
  price === "-" ? price : parseFloat(price.replace(",", ".").replace("£", ""));

exports.checkPrices = checkPrices;
exports.parsePrice = parsePrice;
