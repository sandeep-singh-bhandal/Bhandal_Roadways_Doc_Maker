import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";

const app = express();

// Express Settings
app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use("/static", express.static(path.join(process.cwd(), "public")));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bhandal-roadways-doc-maker.vercel.app",
    ],
  })
);
app.get("/bilty-preview", (req, res) => {
  const bilty = {
    lrNo: "LR12345",
    truckNo: "CG01AB1234",
    from: "Raipur",
    to: "Bhilai",
    consignor: { name: "ABC Traders", address: "123 Street, Raipur", gstNumber: "22AAAAA0000A1Z5" },
    consignee: { name: "XYZ Industries", address: "456 Market Road, Bhilai", gstNumber: "33BBBBB1111B2Z6" },
    packages: [
      { description: "Iron Rods", weight: 10, rate: 5000, freight: 50000 },
      { description: "Cement Bags", weight: 20, rate: 3000, freight: 60000 },
      { description: "Sand", weight: 15, rate: 2000, freight: 30000 },
    ],
    eWayBillNo: "1234567890",
    invoiceNo: "INV12345",
    includeDigitalStamp: true,
  };
  const date = new Date().toLocaleDateString();

  res.render("bilty", { bilty,date });
});
// Generate PDF Route
app.post("/generate-pdf", async (req, res) => {
  const bilty = req.body; // React se aaya hua data

  try {
    // EJS file path
    const filePath = path.join(process.cwd(), "views", "bilty.ejs");
    const date = new Date().toLocaleDateString();
    // Render EJS to HTML
    const html = await ejs.renderFile(filePath, { bilty, date });

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px"},
    });

    await browser.close();

    // Send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=bilty.pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).send("Error generating PDF");
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
