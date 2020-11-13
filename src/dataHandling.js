const got = require("got");
const cheerio = require("cheerio");

const { logAction, getPageMapping } = require("./sheetDataHandling");

const checkPrices = async (urls, sheets) => {
  const mapping = await getPageMapping(sheets);

  await logAction("Getting item prices", sheets);

  let prices = [];

  for (url of urls) {
    if (url === "-") {
      prices.push({
        url: "-",
        price: " ",
      });
      continue;
    }

    const page = await got(url);
    const $ = cheerio.load(page.body);

    const { host } = new URL(url);

    const strippedHost = host.replace("www.", "");

    const siteMapping = mapping.find((map) => map.host === strippedHost);

    if (!siteMapping) {
      await logAction(`ERROR: No mapping for host: ${strippedHost}`, sheets);
      continue;
    }

    const { selector, useHTML } = siteMapping;

    const rawPrice = useHTML ? $(selector).html() : $(selector).text();

    prices.push({
      url,
      price: parsePrice(rawPrice || "-"),
    });
  }

  return prices;
};

const parsePrice = (price) =>
  price === "-" ? price : parseFloat(price.replace(",", "."));

exports.checkPrices = checkPrices;
