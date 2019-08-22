
const http = require('http')
const fs = require('fs');

const cheerio = require("cheerio");
const request = require("request");
const axios = require('axios')

// const file = fs.createWriteStream("file2.idx");
// const req = http.get("http://www.sec.gov/Archives/edgar/full-index/2019/QTR3/master.idx", function(response) {
//   response.pipe(file);
//   file.on('finish', function() {
//     file.close(cb);
//   });
// });

// const file = fs.createWriteStream("file.idx");
// const req = http.get("http://www.sec.gov/Archives/edgar/full-index/2019/QTR3/master.idx", function(response) {
//     console.log(response);  
//     response.pipe(file);
// });

// const file = fs.createWriteStream("archive.idx");
axios.get('http://www.sec.gov/Archives/edgar/full-index/2019/QTR3/master.idx').then((res) => {
    //console.log(Object.keys(res))  
    const arr = res.data.split('\n')
    const items = arr.map(item => item.split('|'))
    const s1Docs = items.filter(item => item[2] === "S-1")

    console.log(s1Docs)
        
})


http.createServer().listen(8080); //the server object listens on port 8080
