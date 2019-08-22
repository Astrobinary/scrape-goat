const cheerio = require("cheerio");
const request = require("request");

request("https://www.sec.gov/Archives/edgar/full-index/2019/QTR3/", (error, response, html) => {
    if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);
        const table = $("[summary=heding]");

        console.log(table.html());
    }
});
