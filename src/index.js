// Core packages, no need to install
const fs = require("fs");
const path = require("path");
const {execSync} = require("child_process");

// YARN or npm packages, need to install
const express = require("express");
const morgan = require("morgan");

// App definition
const app = express();
const router = express.Router();

// App settings
const format = process.env.NODE_ENV === "development" ? "dev" : "combined";
const root = process.env.NODE_ROOT || "/";
const inFolder = process.env.NODE_IN_FOLDER || "/tmp/pdf-outliner/input";
const outFolder = process.env.NODE_OUT_FOLDER || "/tmp/pdf-outliner/output";
const timeout = process.env.NODE_TIMEOUT * 60000 || 600000;
const gs = path.join("/", "usr", "bin", "gs");
const ppm = path.join("/", "usr", "bin", "pdftoppm");
const find = path.join("/", "usr", "bin", "find");
const img2pdf = path.join("/", "usr", "bin", "img2pdf");
const pdfInfo = path.join("/", "usr", "bin", "pdfinfo");

app.set("port", process.env.NODE_PORT || 3000);

// App check - if we don't have ghostscript, lets stop and warn the ops guy to install it
if (!fs.existsSync(gs)) throw new Error("You must install GhostScript first");
if (!fs.existsSync(ppm)) throw new Error("You must install pdftoppm first");
if (!fs.existsSync(find)) throw new Error("You must install find first");
if (!fs.existsSync(img2pdf)) throw new Error("You must install img2pdf first");
if (!fs.existsSync(pdfInfo)) throw new Error("You must install pdfinfo first");
if (!fs.existsSync(inFolder)) fs.mkdirSync(inFolder, {recursive: true});
if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, {recursive: true});

// Clean old files
try {
  const clean = `${find} /tmp/pdf-outliner -mtime +7 -delete`;
  execSync(clean, {stdio: "ignore", timeout: 30000});
  console.log("files older then 7 days was cleaned")
} catch (e) {
  console.log(e);
}

// Middlewares
app.use(morgan(format));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Route monitor - without this, it is impossible to fargate or kubernetes understand if the app stuck and restart it
app.use(root, router.get("/ping", (_req, res) => {
  res.status(200);
  return res.json(response("pong", true, 0));
}));

// outliner: you should pass file name on the body ==> { file: 'my-pdf-file.pdf' }
app.use(root, router.post("/outline", (req, res) => {
  // Payload expected
  if (!req.body.file) {
    res.status(400);
    return res.json(response("bad request (missing file)", false, 0));
  }

  const iFile = path.join(inFolder, req.body.file);
  const oFile = path.join(outFolder, req.body.file);

  if (fs.existsSync(iFile)) {
    const start = Date.now();

    // If the output doesn't exist, let's create it. Why believe that the infra guy will do it when we can do it?
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, {recursive: true});

    // PDF is valid?
    if (!validPDF(iFile)) {
      res.status(507);
      return res.json(response('Corrupted PDF', false, time(start)));
    }

    try {
      const cmd = `${gs} -o ${oFile} -dNoOutputFonts -sDEVICE=pdfwrite ${iFile}`;
      execSync(cmd, {stdio: "ignore", timeout});
      res.status(200);
      return res.json(response(oFile, true, time(start)));
    } catch (convertError) {
      // conversion error
      res.status(507);
      return res.json(response(convertError, false, time(start)));
    }
  }

  res.status(404);
  return res.json(response("file not found", false, 0));
}));

// jpgizer: you should pass file name on the body ==> { file: 'my-pdf-file.pdf' }
app.use(root, router.post("/frozen", async (req, res) => {
  // Payload expected
  if (!req.body.file) {
    res.status(400);
    return res.json(response("bad request (missing file)", false, 0));
  }

  const iFile = path.join(inFolder, req.body.file);
  const oFile = path.join(outFolder, req.body.file);
  let jpgQuality = 10; // from 0 to 100, bigger is better on small resolutions
  let jpgResolution = 300; // 300 is enough for press, 150 to mobile

  if (req.body.options) {
    const options = req.body.options;
    if (options.jpgQuality) jpgQuality = options.jpgQuality;
    if (options.jpgResolution) jpgResolution = options.jpgResolution;
  }

  if (fs.existsSync(iFile)) {
    const start = Date.now();

    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, {recursive: true});

    if (!validPDF(iFile)) {
      res.status(507);
      return res.json(response('Corrupted PDF', false, time(start)));
    }

    try {
      const step1 = `${ppm} ${iFile} ${start} -jpeg -jpegopt progressive=n,quality=${jpgQuality} -rx ${jpgResolution} -ry ${jpgResolution} -aaVector yes`;
      execSync(step1, {stdio: "ignore", timeout});
    } catch (_step1) {
      res.status(507);
      return res.json(response("failed to extract pages", false, time(start)));
    }

    try {
      const step2 = `${img2pdf} $(find -maxdepth 1 -iname '${start}*.jpg' | sort -V) -o ${oFile}`;
      execSync(step2, {stdio: "ignore", timeout});
    } catch (_step2) {
      res.status(507);
      return res.json(response("failed to merge pdf", false, time(start)));
    }

    try {
      const step3 = `rm ${start}*`;
      execSync(step3, {stdio: "ignore", timeout});
    } catch (convertError) {
      console.log("failed to clean JPGs");
    }

    res.status(200);
    return res.json(response(oFile, true, time(start)));
  }

  res.status(404);
  return res.json(response("file not found", false, 0));
}));

function validPDF(file) {
  let tries = 3;
  while (tries) {
    try {
      execSync('sleep 5');
      execSync(`${pdfInfo} ${file}`, {stdio: "ignore", timeout: 30000});
      return true;
    } catch (_error) {
      tries--
    }
  }
  return false;
}

function time(start) {
  return (Date.now() - start) / 1000;
}

function response(message, success, time) {
  if (typeof message === "object") message = JSON.stringify(message);
  return {message, success, time};
}

// Start the server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
