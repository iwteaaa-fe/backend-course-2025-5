const http = require('http');
const path = require('path');
const fs = require('fs')
const { program } = require('commander');

program
    .option('-h, --host <host>', 'Server host')
    .option('-p, --port <port>', 'Server port')
    .option('-c, --cache <path>', 'Path to cache');

program.parse(process.argv);
const options = program.opts();

if (!options.host) {
    console.error('Error: no server host. Use -h or --host.');
    process.exit(1);
}

if (!options.port) {
    console.error('Error: no server port. Use -p or --port.');
    process.exit(1);
}

if (!options.cache) {
    console.error('Error: no cache path. Use -c or --cache.');
    process.exit(1);
}

const host = options.host;
const port = parseInt(options.port, 10);
const cacheDir = path.resolve(options.cache);

try {
    if (!fs.existsSync(cacheDir)) {
        console.log(`Creating directory: ${cacheDir}`);
        fs.mkdirSync(cacheDir, { recursive: true });
    } else {
        console.log(`Directory for cache already exists: ${cacheDir}`);
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Proxy server is working!');
})

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
