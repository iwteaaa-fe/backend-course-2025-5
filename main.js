const http = require('http');
const fs = require('fs/promises');
const path = require('path');
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
const cacheDir = options.cache;

fs.mkdir(cacheDir, { recursive: true })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });

const server = http.createServer(async (req, res) => {
    const httpStatusCode = req.url.slice(1);
    const filePath = path.join(cacheDir, `${httpStatusCode}.jpeg`);

    try {
        switch (req.method) {
            case 'GET':
                try {
                    const data = await fs.readFile(filePath);
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    res.end(data);
                } catch (error) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
                break;

            case 'PUT':
                const chunks = [];
                req.on('data', chunk => chunks.push(chunk));
                req.on('end', async () => {
                    const data = Buffer.concat(chunks);
                    await fs.writeFile(filePath, data);
                    res.writeHead(201, { 'Content-Type': 'text/plain' });
                    res.end('Created');
                });
                break;

            case 'DELETE':
                try {
                    await fs.unlink(filePath);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('OK');
                } catch (error) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
                break;

            default:
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                res.end('Method not allowed');
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
