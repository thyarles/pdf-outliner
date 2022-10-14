// Core packages, no need to install
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// YARN or npm packages, need to install
const express = require("express");
const morgan = require("morgan");

// App definition
const app = express();
const router = express.Router();

// App settings
const format = process.env.NODE_ENV === "development" ? "dev" : "combined";
const root = process.env.NODE_ROOT || "/";
const inFolder = process.env.NODE_IN_FODER || "/tmp/pdf-outliner/input";
const outFolder = process.env.NODE_OUT_FODER || "/tmp/pdf-outliner/output";
const timeout = process.env.NODE_TIMEOUT * 60000 || 600000;
const gs = path.join("/", "usr", "bin", "gs");
const unused = true;
app.set("port", process.env.NODE_PORT || 3000);

// App check - if we don't have ghostscript, lets stop and warn the ops guy to install it
if (!fs.existsSync(gs))
  throw new Error("You should have GhostScript installed on the system");

// Middlewares
app.use(morgan(format));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Route monitor - without this, it is impossible to fargate or kubernetes understand if the app stuck and restart it
app.use(
  root,
  router.get("/ping", (_req, res) => {
    const data = { response: "pong" };
    res.json(data);
  })
);

// Main route - you should pass file name on the body ==> { file: 'my-pdf-file.pdf' }
app.use(
  root,
  router.post("/pdf-outliner", (req, res) => {
    // Payload expected
    if (!req.body.file) {
      res.status(400);
      return res.json({ message: "bad request", success: false, time: 0 });
    }

    const iFile = path.join(inFolder, req.body.file);
    const oFile = path.join(outFolder, req.body.file);

    try {
      if (fs.existsSync(iFile)) {
        const start = Date.now();
        const cmd = `${gs} -o ${oFile} -dNoOutputFonts -sDEVICE=pdfwrite ${iFile}`;

        // If the dir doesn't exist, let's create it. Why believe that the infra guy will do it when we can do it?
        if (!fs.existsSync(inFolder))
          fs.mkdirSync(inFolder, { recursive: true });
        if (!fs.existsSync(outFolder))
          fs.mkdirSync(outFolder, { recursive: true });

        try {
          execSync(cmd, { stdio: "ignore", timeout });
          return res.json({
            message: oFile,
            success: true,
            time: (Date.now() - start) / 1000,
          });
        } catch (convertError) {
          res.status(507); // insufficient storage
          return res.json({ message: convertError, success: false, time: 0 });
        }
      }
      res.status(404); // file not found
      return res.json({ message: "file not found", success: false, time: 0 });
    } catch (mainError) {
      res.status(500); // server internal error
      res.json({ message: JSON.stringify(mainError), success: false, time: 0 });
    }
  })
);

// Start the server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
