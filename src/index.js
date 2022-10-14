const fs = require('fs')
const path = require('path');
const { execSync } = require('child_process');

const express = require('express');
const morgan = require('morgan');

const app = express();
const router = express.Router();


// settings
const format = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
const root = process.env.NODE_ROOT || '/'
const inFolder = process.env.NODE_IN_FODER || '/tmp/input';
const outFolder = process.env.NODE_OUT_FODER || '/tmp/output';
const timeout = process.env.NODE_TIMEOUT * 60000 || 600000;
const gs = path.join('/', 'usr', 'bin', 'gs')
app.set('port', process.env.NODE_PORT || 3000);

// check
if (!fs.existsSync(gs)) throw new Error('You should have GhostScript installed on the system')

// middlewares
app.use(morgan(format));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// route monitor
app.use(root, router.get('/ping', (_req, res) => {
    const data = { response: 'pong' };
    res.json(data);
}));

// route to process pdf
app.use(root, router.post('/pdf-outliner', (req, res) => {
    // You should pass file on the body
    // { file: 'my-pdf-file.pdf' }
    const iFile = path.join(inFolder, req.body.file)
    const oFile = path.join(outFolder, req.body.file)

    try {
        if (fs.existsSync(iFile)) {

            const start = Date.now();
            const cmd = `${gs} -o ${oFile} -dNoOutputFonts -sDEVICE=pdfwrite ${iFile}`;

            try {
                execSync(cmd, { stdio: 'ignore', timeout });
                return res.json({ message: oFile, success: true, time: (Date.now() - start) / 1000 });
            }
            catch (convertError) {
                return res.json({ message: convertError, success: false, time: 0 });
            }
        }
        return res.json({ message: 'file not found', success: false, time: 0 });

    } catch (mainError) {
        res.json({ message: JSON.stringify(mainError), success: false, time: 0 });
    }
}));

// start the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
