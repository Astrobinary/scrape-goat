const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const year = '2019';
const quarter = '3'; // July(7), August(8), Septemeber(9)


// axios.get(`https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/crawler.idx`).then((res) => {
// 	const cleanList = res.data.replace(/[\s\S]*?---?\n/, '').replace(/ {2,}/gm, '  '); // Removes the top header info and normalize spaces for split.
// 	const arr = cleanList.split('\n').map((item) => item.trim().split('  ')); // Splits on every 2 spaces
// 	const potentialIPO = arr.filter((item) => item[1] === 'S-1' || item[1] === 'F-1');

// 	potentialIPO.forEach((job) => {
// 		scrapeBasicIPO(job);
// 	});
// });

// const scrapeBasicIPO = (job) => {
// 	const jobInfo = {
// 		companyName: job[0], formType: job[1], cik: job[2], dateFiled: job[3], linkToDir: job[4], htmlLink: '', isIPO: true,
// 	};

// 	axios.get(job[4]).then((res) => {
// 		const $ = cheerio.load(res.data);

// 		$('a[href]').each((index, elem) => {
// 			if (jobInfo.htmlLink.length > 0) return false;
// 			if ($(elem).attr('href').includes('/Archives/edgar/data/')) jobInfo.htmlLink = $(elem).attr('href');
// 		});

// 	}).then(() => {
// 		axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=0&count=100&output=atom`).then((res) => {
// 			const $ = cheerio.load(res.data);

// 			jobInfo.city = $('[type=business] city').text();
// 			jobInfo.state = $('[type=business] state').text();
// 			jobInfo.zip = $('[type=business] zip').text();

// 			if (formatPhoneNumber($('phone').text()) === null) {
// 				jobInfo.phone = $('phone').text();
// 			} else {
// 				jobInfo.phone = formatPhoneNumber($('phone').text());
// 			}

// 			if ($(`entry [term=${jobInfo.formType}]`).get().length === 1 && $('entry').get().length < 100) {
// 				jobInfo.isIPO = true;
// 			} else if ($(`entry [term=${jobInfo.formType}]`).get().length > 1 && $('entry').get().length < 100) {
// 				jobInfo.isIPO = false;
// 			} else if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $('entry').get().length === 100) {
// 				axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=100&count=100&output=atom`).then((res) => {
// 					const $ = cheerio.load(res.data);

// 					if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $('entry').get().length === 100) {
// 						axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=200&count=100&output=atom`).then((res) => {
// 							const $ = cheerio.load(res.data);

// 							if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && !$('entry').get().length < 100) {
// 								jobInfo.isIPO = false;
// 							}
// 						});
// 					} else {
// 						jobInfo.isIPO = false;
// 					}
// 				});
// 			} else {
// 				jobInfo.isIPO = false;
// 			}

// 			// Push this data to database????
// 			if (jobInfo.isIPO) {
// 				console.log(`${jobInfo.companyName} ${jobInfo.dateFiled} ${jobInfo.isIPO}`);
// 			}
// 		});
// 	});
// };

// Simple number formatter
// const formatPhoneNumber = (phoneNumberString) => {
// 	const cleaned = (`${phoneNumberString}`).replace(/\D/g, '');
// 	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
// 	if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;

// 	return null;
// };


/* TEST FILES BELOW */
// fs.readFile(__dirname + '/IPOs/nt10000709x5_f1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/a2238913zf-1.htm', 'utf8', function (err, html) { // Whole thing is in a table
// fs.readFile(__dirname + '/IPOs/dp109911_s1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/fs12019_thunderbridgeacqii.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/s002626x8_s1.htm', 'utf8', function (err, html) {
// fs.readFile(__dirname + '/IPOs/tv501372_f1.htm', 'utf8', function (err, html) { // Needs work, horrible html coding, no proper line breaks
fs.readFile(__dirname + '/IPOs/S-1.html', 'utf8', function (err, html) {

	if (err) return console.log("ERROR: Make sure to add html files inside IPO folder.");

	const $ = cheerio.load(html);


	//Find marker in table
	let findCopyTO = $('table').filter(function () {
		return $(this).text().trim().includes("Copies to");
	});

	//If not found in table look in p tags
	if (findCopyTO.text().length === 0) {

		//Adds new block
		$('p').filter(function () {
			return $(this).text().trim().includes("Copies to");
		}).nextAll(`table`).first().children().find('td').append('/NEWBLOCK/');

		///Adds newline marker
		$('p').filter(function () {
			return $(this).text().trim().includes("Copies to");
		}).nextAll(`table`).first().children().find('br').replaceWith('/NEWLINE/');

		//Clean us spaces in text
		let clean = $('p').filter(function () {
			return $(this).text().trim().includes("Copies to");
		}).nextAll(`table`).first().children().text().replace(/\s\s+/g, ' ');


		//Replaces clean text with dom text
		findCopyTO = $('p').filter(function () {
			return $(this).text().trim().includes("Copies to");
		}).nextAll(`table`).first().children().text(clean);

	}

	let blocks = findCopyTO.text().replace(/\/NEWLINE\//g, '\n').split('/NEWBLOCK/');

	let lawyerData = {};


	//Create possbile line breaks if html was coded weird.
	blocks.forEach((block, i) => {

		if (block[i] === undefined) return;

		//Handles seperating names
		blocks[i] = blocks[i].replace(/\n?\s?Esq./gim, ' Esq.\n');
		blocks[i] = blocks[i].replace(/\n?\s?LLP/gim, ' LLP\n');

		//Handles phone numbers
		blocks[i] = blocks[i].replace(/(\+[0-9]-)/gim, '\n$1');
		blocks[i] = blocks[i].replace(/(telephone.*?[0-9]*?\))/gmi, '\n$1');
		blocks[i] = blocks[i].replace(/^((?!.*telephone).*)(\([0-9]*\))/gim, '$1\n$2');

		//Cleans up any extra lines/spaces
		blocks[i] = blocks[i].replace(/\s{2,}/gm, '\n').trim();

		lawyerData[i] = [i];

		blocks[i].split('\n').forEach((line, index) => {
			// Filter out text here
			lawyerData[i][index] = line;

		});
	});


	console.log(lawyerData);


});


