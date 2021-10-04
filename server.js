const express = require('express')
const bodyParser = require("body-parser");
const multipart = require('parse-multipart');
const pdf = require('pdf-parse');
const app = express()

app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true})); 

app.get('/', (_, res) => {
    return res.send(
        `
        <form action="/pdf" method="post" enctype="multipart/form-data">
            <input type="file" name="pdf" />
            <button type="submit">submit</button>
            <textarea id="txt" name="txt" ></textarea>
        </form>
        `
    );
});

app.post('/pdf', async function(req, res, next) {
    const boundary = multipart.getBoundary(req.headers['content-type'])

    const data = [];

    await new Promise(resolve => {
        req.on('data', chunk => {
            data.push(Buffer.from(chunk));
        });

        req.on('end', () => {
            resolve()
        });
    });

    const body = Buffer.concat(data);
    const parts = multipart.Parse(body, boundary);
    const results = [];
    for (var i = 0; i < parts.length; i++) {
        const part = parts[i];
        await new Promise(resolve => {
            pdf(part).then(function(data) {

                // number of pages
                console.log(data.numpages);
                // // number of rendered pages
                // console.log(data.numrender);
                // // PDF info
                // console.log(data.info);
                // // PDF metadata
                // console.log(data.metadata);
                // // PDF.js version
                // // check https://mozilla.github.io/pdf.js/getting_started/
                // console.log(data.version);
                // PDF text
                console.log(data.text);

                results.push(data);
                resolve();
            })
        });
    }

    return res.json(results);
});


app.listen(process.env.PORT || 4000, '0.0.0.0', () => console.log('Server listen at port 4000'))