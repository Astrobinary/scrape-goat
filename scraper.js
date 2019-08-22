const http = require('http')
const fs = require('fs');

const cheerio = require("cheerio");
const request = require("request");
const axios = require('axios')

/** need to be able for user to change the year and quarter */
const year = '2019';
const qtr = '3';

axios.get(`http://www.sec.gov/Archives/edgar/full-index/${year}/QTR${qtr}/master.idx`).then((res) => {
    const arr = res.data.split('\n')
    const items = arr.map(item => item.split('|'))
    const s1Docs = items.filter(item => item[2] === "S-1")
    
    /*  logs only S-1 docs */ 
    //console.log(s1Docs)
    
    return s1Docs
}).then(res => {
    return res.map(i => {
        const endURL = i[4]

        /*  logs each of the doc's .txt (html is within this file), we'll need to parse thru this to get data */ 
        /*  console.log(`https://www.sec.gov/Archives/${endURL}`) */
    })
})

http.createServer().listen(8080); 
