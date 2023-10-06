const http = require('http');
const url = require('url');
const {promisify} = require('util');
const dnsLookup = promisify(require('dns').lookup);

const TIMEOUT = 500;

async function fetchNumbers(targetUrl) {
    return new Promise((resolve, reject) => {
        let req = http.get(targetUrl, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    let parsedData = JSON.parse(data);
                    resolve(parsedData.numbers);
                } catch (e) {
                    resolve([]);
                }
            });
        });

        req.on('error', (err) => {
            resolve([]);
        });

        req.setTimeout(TIMEOUT, () => {
            req.destroy();
            resolve([]);
        });
    });
}

http.createServer(async (req, res) => {
    if (req.url.startsWith('/numbers')) {
        let queryData = url.parse(req.url, true).query;
        let urls = Array.isArray(queryData.url) ? queryData.url : [queryData.url];
        let numbersPromises = urls.map(async (targetUrl) => {
            try {
                let urlObj = new URL(targetUrl);
                await dnsLookup(urlObj.hostname);
                return fetchNumbers(targetUrl);
            } catch (e) {
                return [];
            }
        });

        let allNumbers = await Promise.all(numbersPromises);
        let mergedNumbers = [].concat.apply([], allNumbers);
        let uniqueSortedNumbers = [...new Set(mergedNumbers)].sort((a, b) => a - b);

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({numbers: uniqueSortedNumbers}));
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(3000);
