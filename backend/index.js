import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use("/static", express.static("public"));
app.use(cors({
  origin: "https://bhandal-roadways-doc-maker.vercel.app",
}));

app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;
  if (!html) return res.status(400).send("HTML content is required");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions"
      ]
    });

    const page = await browser.newPage();
    await page.setContent(`
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            body { background-color: transparent; }
            #bilty-container { background-color: transparent; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px" },
      preferCSSPageSize: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=bilty.pdf",
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
