const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const year = "2019";
const quarter = "3"; // July(7), August(8), Septemeber(9)

// axios.get(`https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/crawler.idx`).then(res => {
//     const cleanList = res.data.replace(/[\s\S]*?---?\n/, "").replace(/ {2,}/gm, "  "); // Removes the top header info and normalize spaces for split.
//     const arr = cleanList.split("\n").map(item => item.trim().split("  ")); // Splits on every 2 spaces
//     const potentialIPO = arr.filter(item => item[1] === "S-1" || item[1] === "F-1");

//     potentialIPO.forEach(job => {
//         scrapeBasicIPO(job);
//     });
// });

// const scrapeBasicIPO = job => {
//     const jobInfo = {
//         companyName: job[0],
//         formType: job[1],
//         cik: job[2],
//         dateFiled: job[3],
//         linkToDir: job[4],
//         htmlLink: "",
//         isIPO: true
//     };

//     // Use to find who filed: https://www.secinfo.com/$/Search.asp?Find=0001144204
//     // Live feed!! https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=s-1&company=&dateb=&owner=include&start=0&count=100&output=atom

//     axios
//         .get(job[4])
//         .then(res => {
//             const $ = cheerio.load(res.data);

//             $("a[href]").each((index, elem) => {
//                 if (jobInfo.htmlLink.length > 0) return false;
//                 if (
//                     $(elem)
//                         .attr("href")
//                         .includes("/Archives/edgar/data/")
//                 )
//                     jobInfo.htmlLink = $(elem).attr("href");
//             });
//         })
//         .then(() => {
//             axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=0&count=100&output=atom`).then(res => {
//                 const $ = cheerio.load(res.data);

//                 jobInfo.city = $("[type=business] city").text();
//                 jobInfo.state = $("[type=business] state").text();
//                 jobInfo.zip = $("[type=business] zip").text();

//                 if (getPhoneNumber($("phone").text()) === null) {
//                     jobInfo.phone = $("phone").text();
//                 } else {
//                     jobInfo.phone = getPhoneNumber($("phone").text());
//                 }

//                 if ($(`entry [term=${jobInfo.formType}]`).get().length === 1 && $("entry").get().length < 100) {
//                     jobInfo.isIPO = true;
//                 } else if ($(`entry [term=${jobInfo.formType}]`).get().length > 1 && $("entry").get().length < 100) {
//                     jobInfo.isIPO = false;
//                 } else if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $("entry").get().length === 100) {
//                     axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=100&count=100&output=atom`).then(res => {
//                         const $ = cheerio.load(res.data);

//                         if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $("entry").get().length === 100) {
//                             axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=200&count=100&output=atom`).then(res => {
//                                 const $ = cheerio.load(res.data);

//                                 if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && !$("entry").get().length < 100) {
//                                     jobInfo.isIPO = false;
//                                 }
//                             });
//                         } else {
//                             jobInfo.isIPO = false;
//                         }
//                     });
//                 } else {
//                     jobInfo.isIPO = false;
//                 }

//                 // Push this data to database????
//                 if (jobInfo.isIPO) {
//                     axios.get(`https://www.sec.gov/${jobInfo.htmlLink}`).then(res => {
//                         console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
//                         console.log(`${jobInfo.companyName} ${jobInfo.dateFiled} ${jobInfo.htmlLink}`);
//                         scrapeHTML(res.data);
//                         console.log(`-------------------------------------------------------------------`);
//                     });
//                 }
//             });
//         });
// };

// Simple number formatter
const getPhoneNumber = phoneNumberString => {
    // const cleaned = (`${phoneNumberString}`).replace(/\D/g, '');
    const match = phoneNumberString.match(/[\+]?([(]?[0-9]{3}[)]?)([-\s\.]?[0-9]{3})[-\s\.]?([0-9]{4,6})/im);
    if (match) return `(${match[1]}) ${match[2].replace(/[^0-9]+/g, "")}-${match[3].replace(/[^0-9]+/g, "")}`.replace(/(\(+)/gm, "(").replace(/(\)+)/gm, ")");

    return phoneNumberString;
};

/* TEST FILES BELOW */
// fs.readFile(__dirname + '/IPOs/nt10000709x5_f1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/a2238913zf-1.htm', 'utf8', function (err, html) { // Whole thing is in a table
// fs.readFile(__dirname + '/IPOs/dp109911_s1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/fs12019_thunderbridgeacqii.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/s002626x8_s1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + "/IPOs/zzz.htm", "utf8", function(err, html) {
//     // Does not have underwriter table
//     // fs.readFile(__dirname + "/IPOs/S-1.html", "utf8", function(err, html) {
//     if (err) return console.log("ERROR: Make sure to add html files inside IPO folder.");

//     //Array of lawfirm columns
//     let lawFirmData = getLawyerData(html);
//     let maxAggregate = getMaxAggregate(html);
//     // let underwriterTable = getUnderwriterTable(html);
//     // let underwriters = getUnderwriters(html);

//     console.log(lawFirmData);
//     console.log(maxAggregate);
//     // console.log(underwriterTable);
// });

const scrapeHTML = html => {
    let obj = {};

    let lawFirmData = getLawyerData(html);
    let maxAggregate = getMaxAggregate(html);

    // obj.maxAggregate = maxAggregate;

    console.log(lawFirmData);

    return obj;
};

const getLawyerData = html => {
    const $ = cheerio.load(html);

    //Find marker in table
    let findCopyTO = $("table").filter(function() {
        return $(this)
            .text()
            .toUpperCase()
            .includes("COPIES TO");
    });

    //If not found in table look in p tags
    if (findCopyTO.text().length === 0) {
        let targetTable = $("p")
            .filter(function() {
                return $(this)
                    .text()
                    .toUpperCase()
                    .includes("COPIES");
            })
            .nextAll()
            .first();

        targetTable.find("td").append("/NEWBLOCK/");
        targetTable.find("br").append("/NEWLINE/");

        // if (!findCopyTO.text().includes("/NEWLINE/")) console.log("only 1 line!");

        let clean = targetTable.text().replace(/\s\s+/g, " ");
        findCopyTO = targetTable.text(clean);
    } else {
        let targetTable = $("table")
            .filter(function() {
                return $(this)
                    .text()
                    .toUpperCase()
                    .includes("COPIES TO");
            })
            .children();

        targetTable.find("td").append("/NEWBLOCK/");
        targetTable.find("br").append("/NEWLINE/");

        console.log(targetTable.text());

        let clean = targetTable.text().replace(/\s\s+/g, " ");
        findCopyTO = targetTable.text(clean);
    }

    let blocks = findCopyTO
        .text()
        .replace(/\/NEWLINE\//g, "\n")
        .split("/NEWBLOCK/");

    let lawyerData = [];

    //Create possbile line breaks if html was coded weird.
    blocks.forEach((block, i) => {
        if (block.includes("Copies to")) return;
        if (!block.match(/[^\s]/gm)) return;

        //Handles seperating names
        blocks[i] = blocks[i].replace(/\n?\s?Esq./gim, " Esq.\n");
        blocks[i] = blocks[i].replace(/\n?\s?P.C./gim, " P.C.\n");
        blocks[i] = blocks[i].replace(/\n?\s?Corporation/gim, " Corporation\n");
        blocks[i] = blocks[i].replace(/\n?\s?LLP/gim, " LLP\n");

        //Handles phone numbers
        blocks[i] = blocks[i].replace(/(\+[0-9]-)/gim, "\n$1");
        blocks[i] = blocks[i].replace(/(telephone.*?[0-9]*?\))/gim, "\n$1");
        blocks[i] = blocks[i].replace(/^((?!.*telephone).*)(\([0-9]*\))/gim, "$1\n$2");

        //Cleans up any extra lines/spaces
        blocks[i] = blocks[i].replace(/\s{2,}/gm, "\n").trim();

        let temp = [];

        blocks[i].split("\n").forEach(el => {
            if (!el.match(/[^\s]/gm)) return;
            temp.push(el.trim());
        });

        lawyerData.push(temp);
    });

    return parseLawyerData(lawyerData);
};

// Left: Issuers Law Firm || Middle: Special Counsel || Right: Underwriter Law Firm
const parseLawyerData = data => {
    let objData = [];

    for (let i = 0; i < data.length; i++) {
        const firm = data[i];
        let temp = {
            lawyers: [],
            name: "",
            address: "",
            phone: ""
        };

        if (firm === undefined) return;

        for (let x = 0; x < firm.length; x++) {
            const line = firm[x];

            //Grab easy lawyer value
            if (line.toUpperCase().includes("ESQ.")) {
                temp.name = temp.lawyers.push(firm[x]);
            }

            //Grab easy company value
            if (line.toUpperCase().includes("LLP") || line.toUpperCase().includes("L.L.P") || line.toUpperCase().includes("INC.") || line.toUpperCase().includes("P.C.") || line.toUpperCase().includes("CORPORATION")) {
                temp.name = firm[x];
            }

            //Grab easy phone value last line
            if (firm[firm.length - 1].replace(/[^0-9]/g, "").length >= 7) {
                if (firm[firm.length - 1].includes("fac")) {
                    temp.fax = getPhoneNumber(firm[firm.length - 1]);
                } else {
                    temp.phone = getPhoneNumber(firm[firm.length - 1]);
                }

                //2nd to last line. Possible: Number, Country, Start of Address
                if (firm[firm.length - 2].replace(/[^0-9]/g, "").length >= 7) {
                    if (firm[firm.length - 2].includes("fac")) {
                        temp.fax = getPhoneNumber(firm[firm.length - 2]);
                    } else {
                        temp.phone = getPhoneNumber(firm[firm.length - 2]);
                    }

                    //Double number, next lines should be address
                    if (temp.name.length < 1) {
                        //3 line address, maybe because of country listed.
                        temp.address = `${firm[firm.length - 5]}, ${firm[firm.length - 4]}, ${firm[firm.length - 3]}`;

                        //Line 6 would be company if here so above -6 has to be lawyers
                        if (x <= firm.length - 6 && temp.name.length < 1) {
                            temp.lawyers.push(firm[x]);
                        }
                    } else {
                        if (firm[firm.length - 4].toUpperCase().includes("LLP") || firm[firm.length - 4].toUpperCase().includes("L.L.P")) {
                            temp.address = `${firm[firm.length - 3]}`;
                        } else {
                            temp.address = `${firm[firm.length - 4]}, ${firm[firm.length - 3]}`;
                        }

                        if (x <= firm.length - 4 && temp.name.length < 1) {
                            temp.lawyers.push(firm[x]);
                        }
                    }
                } else {
                    if (firm[firm.length - 2].match(/\d/gm)) {
                        temp.address = `${firm[firm.length - 3]}, ${firm[firm.length - 2]}`;
                        //Line 5 would be company if here so above -4 has to be lawyers
                        if (x <= firm.length - 4 && temp.name.length < 1) {
                            temp.lawyers.push(firm[x]);
                        }
                    } else {
                        //3 line address, maybe because of country listed.
                        temp.address = `${firm[firm.length - 4]}, ${firm[firm.length - 3]}, ${firm[firm.length - 2]}`;
                        //Line 5 would be company if here so above -6 has to be lawyers
                        if (x <= firm.length - 6 && temp.name.length < 1) {
                            temp.lawyers.push(firm[x]);
                        }
                    }
                }
            } else {
                if (firm[firm.length - 1].match(/\d/gm)) {
                    temp.address = `${firm[firm.length - 2]}, ${firm[firm.length - 1]}`;

                    //Line 5 would be company if here so above -4 has to be lawyers
                    if (x <= firm.length - 3 && temp.name.length < 1) {
                        temp.lawyers.push(firm[x]);
                    }
                } else {
                    //3 line address, maybe because of country listed.
                    temp.address = `${firm[firm.length - 4]}, ${firm[firm.length - 2]}, ${firm[firm.length - 1]}`;

                    //Line 5 would be company if here so above -6 has to be lawyers
                    if (x <= firm.length - 5 && temp.name.length < 1) {
                        temp.lawyers.push(firm[x]);
                    }
                }
            }
        }
        objData.push(temp);
    }

    return objData;
};

const getMaxAggregate = html => {
    const $ = cheerio.load(html);

    let targetTable = $("table")
        .filter(function() {
            return $(this)
                .text()
                .toUpperCase()
                .includes("AMOUNT");
        })
        .first()
        .children();

    var numberPattern = /[0-9.,]+/gm;
    const list = targetTable.text().match(numberPattern);

    let numList = list
        .map(i => {
            return parseInt(i.replace(/,/gm, ""));
        })
        .filter(x => {
            return !isNaN(x);
        });

    return (maxAggregate = Math.max(...numList)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ","));
};

const getUnderwriterTable = html => {
    const $ = cheerio.load(html);

    let tocTable = $("td").filter(function() {
        return $(this)
            .find("a")
            .text()
            .toUpperCase()
            .includes("UNDERWRITING");
    });

    console.log(tocTable);

    let link = tocTable
        .find("a")
        .attr("href")
        .split("#")[1];

    let targetPage = $("p").filter(function() {
        let attr = $(this)
            .find("a")
            .attr("name");
        if (attr === undefined) return;
        if (attr.includes(link)) return $(this);
    });

    let targetTable;

    targetTable = targetPage
        .nextAll()
        .filter(function() {
            if (
                $(this)
                    .children()
                    .first()
                    .has("table")
                    .text()
                    .includes("Number of")
            )
                return $(this)
                    .children()
                    .first()
                    .has("table");
        })
        .first();

    if (/^[a-zA-Z]*$/.test(targetTable.text())) {
        targetTable = targetPage.nextAll("table").first();
    }

    if (!targetTable.text().includes("Number")) {
        console.log("Could not find table...");
    } else {
        // console.log(targetTable.text());
    }
};

const getUnderwriters = html => {
    const $ = cheerio.load(html);

    let bottomMarker = $("p").filter(function() {
        let temp = $(this)
            .text()
            .replace(/\s+/gm, "");
        if (temp.includes("Prospectusdated") || temp.includes("Thedateofthis")) return $(this);
    });

    let table1 = bottomMarker
        .prevAll()
        .has("tr")
        .first();
    let table2 = table1
        .prevAll()
        .has("tr")
        .first();

    let rawUnderwriters = "";

    if (!/\d/.test(table2.text())) {
        table2.find("tr").append("/NEWLINE/");
        rawUnderwriters += table2.text();
        rawUnderwriters += table1.text();
    } else if (!/\d/.test(table1.text())) {
        table1.find("tr").append("/NEWLINE/");
        rawUnderwriters += table1.text();
    } else {
        rawUnderwriters += bottomMarker
            .prevAll()
            .has("b")
            .first()
            .text()
            .replace(/\s/gm, " ");
    }

    let cleanUnderwriters = rawUnderwriters;

    let blocks = cleanUnderwriters.split("/NEWLINE/");
    let underwriterData = [];

    //Create possbile line breaks if html was coded weird.
    blocks.forEach((block, i) => {
        if (!block.match(/[^\s]/gm)) return;
        //Cleans up any extra lines/spaces
        blocks[i] = blocks[i].replace(/\s{2,}/gm, "\n").trim();

        let temp = [];

        blocks[i].split("\n").forEach(el => {
            if (!el.match(/[^\s]/gm)) return;
            temp.push(el.trim());
        });

        underwriterData.push(temp);
    });

    return underwriterData;
};
