const axios = require("axios");
const cheerio = require("cheerio");

const year = "2019";
const quarter = "3";

// const sampleJob = ["SmileDirectClub, Inc.", "S-1", "1775625", "2019-08-16", "https://www.sec.gov/Archives/edgar/data/1775625/0001047469-19-004785-index.htm"];

axios.get(`https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/crawler.idx`).then(res => {
    const cleanList = res.data.replace(/[\s\S]*?---?\n/, "").replace(/ {2,}/gm, "  "); //Removes the top header info and normalize spaces for split.
    const arr = cleanList.split("\n").map(item => item.trim().split("  ")); //Splits on every 2 spaces
    const _s1 = arr.filter(item => item[1] === "S-1");

    _s1.forEach(job => {
        scrapeBasicData(job);
    });

    return _s1;
});



const scrapeBasicData = job => {
    axios.get(job[4]).then(res => {
        const $ = cheerio.load(res.data);

        //Maybe push this data to database
        const companyName = job[0], formType = job[1], cik = job[2], dateFiled = job[3], linkToFile = job[4]

        let htmlLink = "";

        $('a[href]').each((index, elem) => {
            if (htmlLink.length > 0) return false
            if ($(elem).attr('href').includes("/Archives/edgar/data/")) htmlLink = ($(elem).attr('href'))
        });


        const accessionNum = $("#secNum").text().trim().slice(18);
        const mailer = $(".mailer").text().trim().split('\n'); //Grab mailer block
        const address = `${mailer[1].trim()}, ${mailer[3]}`
        const phoneNum = formatPhoneNumber(mailer[8])

        //Sample output
        console.log(`
        Company Name: ${companyName}
        Accession No: ${accessionNum}
        Address: ${address}
        Phone No: ${phoneNum}
        HTML Link: ${htmlLink}
        `)


    }).catch(err => {
        console.log(err);
    });
};

//Simple number formatter 
const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) return '(' + match[1] + ') ' + match[2] + '-' + match[3]

    return null
}


