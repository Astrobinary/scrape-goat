const axios = require("axios");

const year = "2019";
const qtr = "3";

axios.get(`http://www.sec.gov/Archives/edgar/full-index/${year}/QTR${qtr}/crawler.idx`).then(res => {
    const cleanList = res.data.replace(/[\s\S]*?---?\n/, "").replace(/ {2,}/gm, "  ");
    const arr = cleanList.split("\n").map(item => item.trim().split("  "));
    const _s1 = arr.filter(item => item[1] === "S-1");

    console.log(_s1);
});
