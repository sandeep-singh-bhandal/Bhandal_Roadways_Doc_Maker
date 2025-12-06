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


app.get("/status", (req, res) => {
  res.json({ success: true, msg: "Bhandal Roadways PDF Generator API is running." });
});

// Generate PDF Route
app.post("/generate-pdf", async (req, res) => {
  const { biltyData } = req.body;
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


    const totalWeight = biltyData.packages
      .reduce((acc, item) => acc + Number(item.weight), 0)
      .toFixed(3);

    let packageRowsHtml = biltyData.packages.map((item, index) => `
        <tr>
          <td style="border: 1px solid black; padding: 4px; text-align: center;">
            ${index + 1}.
          </td>
          <td style="border: 1px solid black; padding: 4px;">${item.description}</td>
          <td style="border: 1px solid black; padding: 4px;">${item.weight} MT</td>
          <td style="border: 1px solid black; padding: 4px; text-align: center;">
            ${item.rate}
          </td>
          <td style="border: 1px solid black; padding: 4px; text-align: center;">
            ${item.freight}
          </td>
        </tr>
    `).join('');

    if (biltyData.packages.length <= 3) {
      for (let i = 0; i < 3; i++) {
        packageRowsHtml += `
          <tr style="height: 28px;">
            <td style="border: 1px solid black; padding: 4px; text-align: center;"> </td>
            <td style="border: 1px solid black; padding: 4px;"> </td>
            <td style="border: 1px solid black; padding: 4px;"> </td>
            <td style="border: 1px solid black; padding: 4px; text-align: center;"></td>
            <td style="border: 1px solid black; padding: 4px; text-align: center;"></td>
          </tr>
        `;
      }
    }

    const digitalStampHtml = biltyData.includeDigitalStamp ? `
      <img
        src="https://res.cloudinary.com/dybupgtfs/image/upload/v1765005946/stamp_z29wox.jpg"
        alt="stamp"
        style="width: 80px; height: 80px; display: block; margin: 0 auto;"
      />
    ` : '';

    // Transparent background
    await page.setContent(
      `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bhandal Roadways Consignee Copy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playwrite+NO:wght@100..400&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@100..900&family=Playwrite+NO:wght@100..400&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: "Roboto";
        font-size: 14px;
        margin: 0;
        padding: 0;
      }
      .bilty-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      }
      .header-flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .company-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .contact-info {
        text-align: right;
      }
      .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .grid-4-col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .grid-2-col {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div
      id="bilty-container"
      class="bilty-container"
      style="
        max-width: 800px;
        margin: auto;
        padding: 16px;
        background-color: transparent;
        font-size: 14px;
      "
    >
      <header>
        <p
          style="
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 2px;
            text-decoration: underline;
          "
        >
          Subject to Raipur Jurisdiction
        </p>
        <div class="header-flex">
          <img
            src="https://res.cloudinary.com/dybupgtfs/image/upload/v1765005948/logo_zqfw4u.png"
            alt="Bhandal Roadways Logo"
            style="
              width: 120px;
              height: auto;
              margin-left: 16px;
              margin-top: -70px;
            "
          />
          <div class="company-info">
            <h1
              style="
                font-family: 'Anton', sans-serif;
                font-weight: 900;
                font-style: normal;
                font-size: 40px;
                text-align: center;
                letter-spacing: 0.05em;
                margin: 0;
              "
            >
              BHANDAL ROADWAYS
            </h1>
            <p
              style="
                font-size: 14px;
                font-weight: 600;
                background-color: black;
                color: white;
                padding: 1px 64px;
                margin: 5px 0;
              "
            >
              TRANSPORT CONTRACTOR & COMMISSION AGENT
            </p>
            <div class="flex-center" style="margin: 5px 0px; gap: 4px">
              <svg style="height:18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
              <p style="font-size: 14px; font-weight: bold">
                House No: 21, Harshit Vihar, Phase 05, Tatibandh, RAIPUR: 492099
                (C.G)
              </p>
            </div>
            <div
              style="
                font-size: 18px;
                font-weight: bold;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 4px;
                gap: 4px;
              "
            >
              <svg style="height:18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z"/></svg>
              <p>bhandalroadways@gmail.com</p>
            </div>
            <div
              style="
                font-size: 18px;
                font-weight: bold;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 8px 0;
                gap: 4px;
              "
            >
              Transporter ID: 22AHSPB6197L1ZV
            </div>
          </div>
          <div class="contact-info" style="font-size: 12px; margin-top: -80px">
            <div class="flex-center" style="margin-top: 8px; gap: 4px">
              <svg style="height:18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/></svg>
              <p style="font-weight: bold; font-size: 14px">+91 93016 76383</p>
            </div>
            <p style="font-weight: bold; font-size: 14px">+91 94060 21740</p>
            <p style="font-weight: bold; font-size: 14px">+91 79744 79917</p>
          </div>
        </div>
      </header>

      <div style="margin-bottom: 16px; width: 100%">
        <div style="text-align: center">
          <p
            style="
              font-size: 20px;
              font-weight: 800;
              color: rgb(220, 38, 38);
              display: inline-block;
              padding: 0 8px;
            "
          >
            Consignee Copy
          </p>
        </div>
      </div>

      <div
        class="grid-4-col"
        style="
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
        "
      >
        <div
          style="
            width: 100%;
            margin-left: 8px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          "
        >
          <p>
            L.R No:
            <span
              style="
                font-size: 20px;
                font-weight: bold;
                color: rgb(239, 68, 68);
              "
            >
              ${biltyData.lrNo}
            </span>
          </p>
          <div
            style="
              width: 50%;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              margin-right: 8px;
            "
          >
            <p>
              Date:
              <span style="font-weight: bold">
                ${new Date().toLocaleDateString("en-GB")}
              </span>
            </p>
          </div>
        </div>

        <div style="width: 100%; border: 1px solid black; display: flex">
          <p
            style="
              width: 33.33%;
              border-right: 1px solid black;
              margin-left: 8px;
              padding: 4px 0;
            "
          >
            Truck No:
            <span style="font-weight: bold; text-transform: uppercase">
              ${biltyData.truckNo}
            </span>
          </p>
          <p
            style="
              width: 33.33%;
              border-right: 1px solid black;
              margin-left: 8px;
              padding: 4px 0;
            "
          >
            From:
            <span style="font-weight: bold"
              >${biltyData.from}
          </p>
          <p style="width: 33.33%; margin-left: 8px; padding: 4px 0">
            To:
            <span style="font-weight: bold"
              >${biltyData.to}</span
            >
          </p>
        </div>
      </div>

      <div
        class="grid-2-col"
        style="margin-bottom: 16px; font-size: 14px; display: flex"
      >
        <div style="padding: 8px; width: 50%; border-right: none">
          <p>
            Consignor:
            <span style="font-weight: bold"
              >${biltyData.consignor.name}</span
            >
          </p>
          <p style="margin-top: 4px; line-height: 1.25">
            Address:
            <span style="font-weight: bold"
              >${biltyData.consignor.address}</span
            >
          </p>
          <p style="margin-top: 8px">
            <span>GST No:</span>
            <span style="font-weight: bold"
              >
                ${biltyData.consignor.gstNumber}
              </span
            >
          </p>
        </div>
        <div style="padding: 8px; width: 50%">
          <p>
            Consignee:
            <span style="font-weight: bold">
             ${biltyData.consignee.name}</span
            >
          </p>
          <p style="margin-top: 4px">
            Address:
            <span style="font-weight: bold; word-break: break-word">
              ${biltyData.consignee.address}
            </span>
          </p>
          <p></p>
          <p style="margin-top: 8px">
            GST No:
            <span style="font-weight: bold">
              ${biltyData.consignee.gstNumber}
            </span>
          </p>
        </div>
      </div>

      <table
        style="
          border-collapse: collapse;
          border: 1px solid black;
          font-size: 14px;
        "
      >
        <thead>
          <tr
            style="
              background-color: rgb(243, 244, 246);
              font-weight: bold;
              text-align: center;
            "
          >
            <th style="border: 1px solid black; padding: 4px; width: 8.33%">
              S. No.
            </th>
            <th style="border: 1px solid black; padding: 4px; width: 41.67%">
              Description of Load
            </th>
            <th style="border: 1px solid black; padding: 4px; width: 16.67%">
              Quantity
            </th>
            <th style="border: 1px solid black; padding: 4px; width: 16.67%">
              Rate
            </th>
            <th style="border: 1px solid black; padding: 4px; width: 16.67%">
              FREIGHT
            </th>
          </tr>
        </thead>
        <tbody style="text-align: center; font-weight: bold">
          ${packageRowsHtml}
          <tr>
            <td
              colspan="1"
              style="border: 1px solid black; padding: 4px; font-weight: bold"
            ></td>
            <td
              colspan="1"
              style="border: 1px solid black; padding: 4px; font-weight: bold"
            ></td>
            <td
              style="
                border: 1px solid black;
                padding: 4px;
                font-weight: bold;
                font-size: 14px;
              "
            >
              Total:
                ${totalWeight}
              MT
            </td>
            <td colspan="1" style="border: 1px solid black; padding: 4px"></td>
            <td colspan="1" style="border: 1px solid black; padding: 4px"></td>
          </tr>
        </tbody>
      </table>

      <table
        style="
          width: 100%;
          border-right: 1px solid black;
          border-left: 1px solid black;
          border-bottom: 1px solid black;
          font-size: 14px;
        "
      >
        <tbody style="font-weight: bold">
          <tr>
            <td
              style="
                border-right: 1px solid black;
                border-bottom: 1px solid black;
                text-align: left;
                padding: 4px;
                font-weight: bold;
                width: 25%;
                vertical-align: middle;
              "
            >
              e-Way Bill:
                ${biltyData.eWayBillNo}
            </td>

            <td
              style="
                border-right: 1px solid black;
                border-bottom: none;
                text-align: left;
                font-size: 12px;
                padding: 4px;
                font-weight: bold;
                width: 24.9%;
                vertical-align: top;
              "
            >
              • The Goods are accepted for carrier subject to terms and
              condition overleaf.
            </td>

            <td
              style="
                border-right: 1px solid black;
                border-bottom: 1px solid black;
                padding: 4px;
                width: 16.67%;
              "
            ></td>

            <td
              style="
                border-right: 1px solid black;
                border-bottom: 1px solid black;
                text-align: center;
                font-size: 18px;
                padding: 4px;
                font-weight: bold;
                width: 16.67%;
              "
            >
              Balance
            </td>

            <td
              style="
                text-align: center;
                border-right: 1px solid black;
                border-bottom: 1px solid black;
                padding: 4px;
                font-weight: bold;
                width: 16.67%;
              "
            >
              As per decided rate
            </td>
          </tr>

          <tr style="border-bottom: 1px solid black">
            <td
              style="
                border-right: 1px solid black;
                text-align: left;
                padding: 4px;
                font-weight: bold;
                width: 25%;
                vertical-align: middle;
              "
            >
              <div>
                <p style="margin-bottom: 4px">
                  Invoice No.:
                    ${biltyData.invoiceNo}
                </p>
                <p style="text-transform: uppercase">Value: As per invoice</p>
              </div>
            </td>

            <td
              style="
                border-right: 1px solid black;
                text-align: left;
                font-size: 12px;
                padding: 4px;
                font-weight: bold;
                width: 24.9%;
                vertical-align: top;
              "
            >
              • We are only broker not responsible for any type of claim (i.e.
              theft, damage, shortage, leakage, brokerage etc).
            </td>

            <td
              style="
                border-right: 1px solid black;
                text-align: center;
                font-size: 24px;
                padding: 4px;
                font-weight: bold;
                width: 33.43%;
              "
              colspan="2"
            >
              To Pay Total
            </td>

            <td
              style="
                border-right: 1px solid black;
                text-align: center;
                padding: 4px;
                font-weight: bold;
                width: 16.67%;
              "
            ></td>
          </tr>

          <tr>
            <td
              style="
                border-right: 1px solid black;
                text-align: left;
                padding: 4px;
                font-weight: bold;
                width: 22%;
                vertical-align: middle;
              "
            >
              <div>
                <p style="margin-bottom: 8px">HDFC A/C: 50200098240792</p>
                <p style="text-transform: uppercase">IFSC CODE: HDFC0003692</p>
              </div>
            </td>

            <td
              colspan="2"
              style="
                border-right: 1px solid black;
                text-align: center;
                font-size: 16px;
                padding: 4px;
                font-weight: bold;
                width: 48%;
                vertical-align: middle;
              "
            >
              <div style="margin: 12px 0">
                <p>GST Tax Will Be Paid By</p>
                <div
                  style="
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    margin-top: 8px;
                  "
                >
                  <label
                    style="
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      margin-bottom: 16px;
                    "
                  >
                    <input
                      type="checkbox"
                      style="height: 16px; width: 16px; margin-right: 4px"
                    />
                    <span
                      style="font-size: 14px; color: #1f2937; font-weight: bold"
                    >
                      Consignor
                    </span>
                  </label>

                  <label
                    style="
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      margin-bottom: 16px;
                    "
                  >
                    <input
                      type="checkbox"
                      style="height: 16px; width: 16px; margin-right: 4px"
                    />
                    <span
                      style="font-size: 14px; color: #1f2937; font-weight: bold"
                    >
                      Consignee
                    </span>
                  </label>
                </div>
              </div>
            </td>

            <td
              colspan="2"
              style="
                border-right: 1px solid black;
                font-size: 24px;
                padding: 4px;
                font-weight: bold;
                width: 30%;
                text-align: center;
                vertical-align: bottom;
              "
            >
              <div style="font-size: 14px; text-align: right; margin-top: 4px">
                ${digitalStampHtml}
                <p
                  style="
                    font-weight: normal;
                    margin-right: 8px;
                    margin-top: 4px; /* Default margin if stamp is present */
                  "
                >
                  For, <span style="font-weight: bold">Bhandal Roadways</span>
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>

      `,
      { waitUntil: "networkidle0", timeout: 900000 },
    );

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // text/images render properly
      margin: { top: "20px" },
      preferCSSPageSize: true,
      timeout: 9000000,
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
  } finally {
    // 2. GUARANTEED CLOSURE: Close the browser instance
    if (browser) {
      await browser.close();
      console.log("Puppeteer browser closed successfully.");
    }
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





