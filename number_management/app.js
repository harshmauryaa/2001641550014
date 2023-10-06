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

