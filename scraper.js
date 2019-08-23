const axios = require("axios");
const cheerio = require("cheerio");

const year = "2019";
const qtr = "3";

const sampleJob = ["SmileDirectClub, Inc.", "S-1", "1775625", "2019-08-16", "https://www.sec.gov/Archives/edgar/data/1775625/0001047469-19-004785-index.htm"];

const fetchOnlyS1 = (year, quarter) => {
    axios.get(`https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/crawler.idx`).then(res => {
        const cleanList = res.data.replace(/[\s\S]*?---?\n/, "").replace(/ {2,}/gm, "  ");
        const arr = cleanList.split("\n").map(item => item.trim().split("  "));
        const _s1 = arr.filter(item => item[1] === "S-1");

        return _s1;
    });
};

const scrapeData = job => {
    axios.get(job[4]).then(res => {
        const $ = cheerio.load(res.data);

        const accessionNum = $("#secNum").text().trim().slice(18);

        const mailer = $(".mailer").text().trim().split('\n');
        const address = `${mailer[1].trim()}, ${mailer[3]}`
        const phoneNum = formatPhoneNumber(mailer[8])

        console.log(`
        Accession No: ${accessionNum}
        Address: ${address}
        Phone No: ${phoneNum}
        `)


    }).catch(err => {
        console.log(err);
    });
};


const formatPhoneNumber = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return null
}


scrapeData(sampleJob);
