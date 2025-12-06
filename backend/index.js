import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import puppeteer from "puppeteer";
import path from "path";


const app = express();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bhandal-roadways-doc-maker.vercel.app",
    ],
  })
);

app.use("/static", express.static(path.join(process.cwd(), "public")));

// Generate PDF Route
app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).send("HTML content is required");
  }

  try {
    const browser = await puppeteer.launch({
      args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--allow-file-access-from-files', // Enables assets loaded via file:// or similar
            '--disable-web-security' // Might be needed for local font access
        ],
    });
    const page = await browser.newPage();

    // Transparent background
    await page.setContent(
      `
      <html>
        <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
          @font-face {
          font-family: 'impact';
          src: url('https://res.cloudinary.com/dybupgtfs/raw/upload/v1765005946/impact_f2ejy6.ttf') format('ttf');
          font-weight: normal;
          font-style: normal;
          }
            body {
              background-color: transparent; 
             }
            #bilty-container { background-color: transparent; }
            .size-4 { width: 1rem; height: 1rem; }
            .size-20 { width: 5rem; height: 5rem; }
            .size-30 { width: 7.5rem; height: 7.5rem; }
            .wrap-break-word { word-wrap: break-word; } 
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
      `,
      { waitUntil: "networkidle2", timeout: 60000 },
    );

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // text/images render properly
      margin: { top: "20px" },
      preferCSSPageSize: true
    });

    await browser.close();

    // PDF as download
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

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





