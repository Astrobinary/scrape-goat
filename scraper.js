const cheerio = require("cheerio");
const request = require("request");

request("https://new.nasdaq.com/", (error, response, html) => {
    if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        const main = $(".content-dashboard-top-reads__title");

        console.log(main.html());
    }
});
