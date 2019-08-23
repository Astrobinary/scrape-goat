const axios = require('axios');
const cheerio = require('cheerio');

const year = '2019';
const quarter = '3'; // July(7), August(8), Septemeber(9)


axios.get(`https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/crawler.idx`).then((res) => {
	const cleanList = res.data.replace(/[\s\S]*?---?\n/, '').replace(/ {2,}/gm, '  '); // Removes the top header info and normalize spaces for split.
	const arr = cleanList.split('\n').map((item) => item.trim().split('  ')); // Splits on every 2 spaces
	const potentialIPO = arr.filter((item) => item[1] === 'S-1' || item[1] === 'F-1');

	potentialIPO.forEach((job) => {
		scrapeBasicIPO(job);
	});
});

const scrapeBasicIPO = (job) => {
	const jobInfo = {
		companyName: job[0], formType: job[1], cik: job[2], dateFiled: job[3], linkToDir: job[4], htmlLink: '', isIPO: true,
	};

	axios.get(job[4]).then((res) => {
		const $ = cheerio.load(res.data);

		$('a[href]').each((index, elem) => {
			if (jobInfo.htmlLink.length > 0) return false;
			if ($(elem).attr('href').includes('/Archives/edgar/data/')) jobInfo.htmlLink = $(elem).attr('href');
		});
	}).then(() => {
		axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=0&count=100&output=atom`).then((res) => {
			const $ = cheerio.load(res.data);

			jobInfo.city = $('[type=business] city').text();
			jobInfo.state = $('[type=business] state').text();
			jobInfo.zip = $('[type=business] zip').text();

			if (formatPhoneNumber($('phone').text()) === null) {
				jobInfo.phone = $('phone').text();
			} else {
				jobInfo.phone = formatPhoneNumber($('phone').text());
			}

			if ($(`entry [term=${jobInfo.formType}]`).get().length === 1 && $('entry').get().length < 100) {
				jobInfo.isIPO = true;
			} else if ($(`entry [term=${jobInfo.formType}]`).get().length > 1 && $('entry').get().length < 100) {
				jobInfo.isIPO = false;
			} else if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $('entry').get().length === 100) {
				axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=100&count=100&output=atom`).then((res) => {
					const $ = cheerio.load(res.data);

					if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && $('entry').get().length === 100) {
						axios.get(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${jobInfo.cik}&type=&dateb=&owner=exclude&start=200&count=100&output=atom`).then((res) => {
							const $ = cheerio.load(res.data);

							if ($(`entry [term=${jobInfo.formType}]`).get().length === 0 && !$('entry').get().length < 100) {
								jobInfo.isIPO = false;
							}
						});
					} else {
						jobInfo.isIPO = false;
					}
				});
			} else {
				jobInfo.isIPO = false;
			}

			// Push this data to database????
			if (jobInfo.isIPO) {
				console.log(`${jobInfo.companyName} ${jobInfo.dateFiled} ${jobInfo.isIPO}`);
			}
		});
	});
};

// Simple number formatter
const formatPhoneNumber = (phoneNumberString) => {
	const cleaned = (`${phoneNumberString}`).replace(/\D/g, '');
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;

	return null;
};
