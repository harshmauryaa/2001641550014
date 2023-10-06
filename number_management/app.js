const http = require('http');
const url = require('url');
const {promisify} = require('util');
const dnsLookup = promisify(require('dns').lookup);
