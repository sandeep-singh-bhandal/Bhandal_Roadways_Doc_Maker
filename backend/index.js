import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from 'fs';
import path from 'path';
import PDFDocument from "pdfkit";
import { drawBiltyPage } from "./drawBilty.js";

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
  // const mockBiltyData = {
  //   lrNo: "77", truckNo: "CG04QA4780", from: "Raipur, Chhattisgarh", to: "Kadodara, Gujarat",
  //   consignor: { name: "SATYAM STEEL", address: "BLOCK-146/C, TANTITHAIYA, KADODARA, BARDOLI ROAD SURAT SUNNY SUNNY SUNNY SUNNY SUNNY Sunny", gstNumber: "22AEGFS8130R1ZK" },
  //   consignee: { name: "STARK INDUSTRIES INDIA", address: "BLOCK-146/C, TANTITHAIYA, KADODARA, BARDOLI ROAD SURAT SU", gstNumber: "24BBCPA6477M1ZI" },
  //   packages: [
  //     { description: "SATYAM STEEL", weight: "16.560", rate: "Fix", freight: "To Pay" },
  //     { description: "MS STRIPS (72111950)", weight: "17.760", rate: "Fix", freight: "To Pay" },
  //     { description: "RAIPH 49111", weight: "", rate: "", freight: "" }, // Empty row example
  //   ],
  //   eWayBillNo: "8916722901094", invoiceNo: "SS/25-26/1098", includeDigitalStamp: true,
  // };
  try {
    const data = biltyData;

    // 💡 FIX 2: Define 'date' and 'totalWeight' variables, which were missing.
    const doc = new PDFDocument({
      size: 'A4',
      margin: 20
    });
    const PUBLIC_ROOT = path.join(process.cwd(), 'public');
    const fontPath = path.join(PUBLIC_ROOT, 'impact.ttf');
    if (fs.existsSync(fontPath)) { doc.registerFont('Impact', fontPath); }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bilty-preview.pdf"`);

    doc.pipe(res);
    drawBiltyPage(doc, data, "Driver Copy")
    doc.addPage()
    drawBiltyPage(doc, data, "Consignee Copy")
    doc.addPage()
    drawBiltyPage(doc, data, "Consignor Copy")



    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

// generate bill pdf route
app.post("/generate-bill-pdf", async (req, res) => {
  const { billData } = req.body;
  try {
    // const BillDataMock = {
    //   // --- General Bill Information ---
    //   billNo: "56",
    //   receipientName: "Siddharth Trading Corp.",
    //   receipientAddress: "",
    //   through: "Hindustan Roadlines",
    //   vehicleNo: "MH-12-DE-5678",
    //   from: "Delhi (NCR)",
    //   to: "Pune (Maharashtra)",
    //   includeDigitalStamp: true,

    //   // --- Financial Summary ---
    //   billDetails: {
    //     // Total Freight from all LRs: (59500 + 44000) = 103500.00
    //     halting: "", // Charge for waiting/delay
    //     extra: "", // Miscellaneous charges (e.g., labour)
    //     total: "", // (103500 + 2000 + 1500)
    //     advance: "",
    //     balance: "", // (107000 - 40000)
    //   },

    //   // --- Lorry Receipts (LRs) Detail Array ---
    //   lrs: [
    //     {
    //       lrNo: "71",
    //       date: "2025-12-10",
    //       invoiceNo: "INV-BTL-9876",
    //       weight: "15.120",
    //       chargeWeight: "Same", // Using 'Same' as specified
    //       rate: "2500", // Rate per unit of chargeWeight (per Kg)
    //       freight: "54600", // Calculated: 7000 * 8.50
    //     },
    //     {
    //       lrNo: "72",
    //       date: "2025-12-10",
    //       invoiceNo: "INV-XYZ-1201",
    //       weight: "25.110",
    //       chargeWeight: "Same", // Using a different charge weight for variety
    //       rate: "2350", // Rate per unit of chargeWeight (per Kg)
    //       freight: "44000", // Calculated: 5000 * 8.80
    //     },
    //     {}, {}, {}
    //   ],
    // };
    const data = billData;

    // 💡 FIX 2: Define 'date' and 'totalWeight' variables, which were missing.
    const date = new Date().toLocaleDateString("en-GB");

    const doc = new PDFDocument({
      size: 'A4',
      margin: 20
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bill.pdf"`);

    doc.pipe(res);

    const MARGIN_X = 30; // Left margin
    const PAGE_WIDTH = 595.28 - MARGIN_X * 2; // A4 width is 595.28 pts
    let currentY = 30;

    const PUBLIC_ROOT = path.join(process.cwd(), 'public'); // Define PUBLIC_ROOT
    // Register custom font
    try {
      doc.registerFont('Impact', path.join(PUBLIC_ROOT, 'impact.ttf'));
    } catch (e) {
      console.warn("Custom font not found");
    }

    doc.rect(MARGIN_X, currentY - 6, PAGE_WIDTH, data.receipientAddress.length > 100 ? 710 : 690).stroke();

    // --- 2. TOP HEADER (LOGO, TITLE, CONTACTS) ---

    // Logo (Approximate Positioning)
    const LOGO_SIZE = 80;
    const LOGO_PATH = path.join(PUBLIC_ROOT, 'logo.png');
    try {
      doc.image(LOGO_PATH, MARGIN_X + 10, currentY + 5, {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
      });
    } catch (e) {
      // Draw a placeholder box if logo is missing
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }
    // Title
    doc.font('Impact')
      .fontSize(36)
      .text('BHANDAL ROADWAYS', MARGIN_X + 80, currentY + 2, {
        width: PAGE_WIDTH - 160,
        align: 'center'
      });

    const PHONE_ICON_SIZE = 14;
    const PHONE_ICON = path.join(PUBLIC_ROOT, 'phone.png');
    try {
      doc.image(PHONE_ICON, MARGIN_X + 435, currentY + 11, {
        width: PHONE_ICON_SIZE,
        height: PHONE_ICON_SIZE,
      });
    } catch (e) {
      // Draw a placeholder box if logo is missing
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }

    // Contact Numbers (Right Side)
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .text('+91 93016 76383', PAGE_WIDTH - 55, currentY + 14, { align: 'left' });
    doc.text('+91 94060 21740', PAGE_WIDTH - 55, currentY + 26, { align: 'left' });
    doc.text('+91 62612 94248', PAGE_WIDTH - 55, currentY + 38, { align: 'left' });

    // Sub-Title and Address
    currentY += 45;
    const textContent = 'TRANSPORT CONTRACTOR & COMMISSION AGENT';

    // The font metrics (approximations for padding)
    const fontSize = 10;
    const paddingY = 3; // Vertical padding
    const lineHeight = fontSize * 1.2; // Approximate line height

    const boxX = MARGIN_X + 110;
    const boxY = currentY - paddingY + 3; // Shift up by paddingY
    const boxWidth = PAGE_WIDTH - 220;
    const boxHeight = lineHeight + (2 * paddingY);

    // 2. Draw the Black Background Box
    doc.fillColor('black') // Set the fill color to black
      .rect(boxX, boxY, boxWidth, boxHeight) // Define the rectangle area
      .fill(); // Fill the area

    // 3. Draw the White Text with Manual Padding Adjustment
    doc.font('Helvetica-Bold')
      .fontSize(fontSize)
      .fillColor('white') // Set the text color to white
      .text(textContent, MARGIN_X, currentY + 6, {
        // We use MARGIN_X here and rely on 'align: center' to position the text centrally
        align: 'center',
        width: PAGE_WIDTH
      });

    // 4. Reset Fill Color
    currentY += 15; // Move Y position down for the next line
    doc.fillColor('black');


    const LOCATION_ICON_SIZE = 15;
    const LOCATION_ICON = path.join(PUBLIC_ROOT, 'location.png');
    try {
      doc.image(LOCATION_ICON, MARGIN_X + 85, currentY + 5, {
        width: LOCATION_ICON_SIZE,
        height: LOCATION_ICON_SIZE,
      });
    } catch (e) {
      // Draw a placeholder box if logo is missing
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }
    currentY += 10;
    doc
      .fontSize(10)
      .text('House No: 21, Harshit Vihar, Phase 05, Tatibandh, RAIPUR: 492099 (C.G)', MARGIN_X, currentY, { align: 'center' });

    currentY += 16;
    const MAIL_ICON_SIZE = 14;
    const MAIL_ICON = path.join(PUBLIC_ROOT, 'mail.png');
    try {
      doc.image(MAIL_ICON, MARGIN_X + 185, currentY - 4, {
        width: MAIL_ICON_SIZE,
        height: MAIL_ICON_SIZE,
      });
    } catch (e) {
      // Draw a placeholder box if logo is missing
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }
    doc
      .fontSize(10)
      .text('bhandalroadways@gmail.com', MARGIN_X, currentY - 1, { align: 'center' });

    currentY += 15;
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text(`Transporter ID: 22AHSPB6197L1ZV`, MARGIN_X, currentY, { align: 'center' });

    currentY += 20;
    doc.font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('red')
      .text("TRANSPORTING BILL", MARGIN_X - 15, currentY + 2, { align: 'center' });

    doc.moveTo(MARGIN_X, 190).lineTo(PAGE_WIDTH + 30, 190).stroke();

    currentY += 40;

    // --- 3. LR & DATE / FROM & TO BOX ---

    const box1Y = currentY + 8;
    const box1Height = 50;

    // Draw main box border

    // LR No. (Top Left)
    doc.font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('black')
      .text('No:', MARGIN_X + 5, box1Y);

    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('red')
      .text(data.billNo, MARGIN_X + 25, box1Y - 2);

    // Date (Top Right)
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('black')
      .text('Date:', MARGIN_X + 50 + PAGE_WIDTH - 150, box1Y);
    doc.font('Helvetica-Bold')
      .text(date, MARGIN_X + 50 + PAGE_WIDTH - 120, box1Y);

    // To
    let receipientX = MARGIN_X + 5;
    doc.text('To:', receipientX, box1Y + 23);
    doc.text(data.receipientName, receipientX + 20, box1Y + 23);
    doc.text(data.receipientAddress, receipientX, box1Y + 43, { width: PAGE_WIDTH - 5 });

    currentY = box1Y + box1Height + (data.receipientAddress.length > 100 ? 40 : 20);
    doc.moveTo(MARGIN_X, currentY - 10).lineTo(PAGE_WIDTH + 30, currentY - 10).stroke();
    doc.moveTo((PAGE_WIDTH + 60) / 2, currentY - 10).lineTo((PAGE_WIDTH + 60) / 2, currentY + box1Height + 30).stroke();

    // --- 4. CONSIGNOR / CONSIGNEE BOX ---

    const consigY = currentY
    // (data.consignor.address.length > 86 || data.consignee.address.length > 86)
    //   ? currentY + 20
    //   : (data.consignor.address.length > 57 || data.consignee.address.length > 57)
    //     ? currentY + 10
    //     : currentY;
    const consigHeight = 50;


    // Left (Consignor)
    let consigX = MARGIN_X + 5;
    doc.font('Helvetica-Bold').fontSize(12);

    doc.text('Vehicle No:', consigX, currentY + 8);
    doc.font('Helvetica-Bold').text(data.vehicleNo, consigX + 66, currentY + 8);

    doc.font('Helvetica-Bold').text('Through:', consigX, currentY + 32);
    doc.text(data.through, consigX + 54, currentY + 32, { width: PAGE_WIDTH / 2 - 70 });

    // Right (Consignee)
    consigX = MARGIN_X + PAGE_WIDTH / 2 + 5;

    doc.font('Helvetica-Bold').fontSize(12);

    doc.text('From:', consigX, currentY + 8);
    doc.font('Helvetica-Bold').text(data.from, consigX + 34, currentY + 8);

    doc.font('Helvetica-Bold').text('To:', consigX, currentY + 32);
    doc.text(data.to, consigX + 20, currentY + 32, { width: PAGE_WIDTH / 2 - 70 });

    currentY = consigY + consigHeight;

    // --- 5. PACKAGE DATA TABLE ---
    const tableY = currentY + 10;
    const rowHeight = 30;
    const headerHeight = 30;

    // Define column layout (Total width = 535)
    const tableColumns = [
      { name: "LR No.", width: 60, align: 'center', field: 'lrNo' },
      { name: "Date", width: 80, align: 'center', field: 'date' },
      { name: "Invoice No.", width: 100, align: 'center', field: 'invoiceNo' },
      { name: "Weight", width: 75, align: 'center', field: 'weight' },
      { name: "Charge Wt.", width: 75, align: 'center', field: 'chargeWeight' },
      { name: "Rate", width: 70, align: 'center', field: 'rate' },
      { name: "FREIGHT", width: 75, align: 'center', field: 'freight' }
    ];
    const RUPEE_ICON_SIZE = 12;
    const RUPEE_ICON = path.join(PUBLIC_ROOT, 'rupee.png');
    const RUPEE_ICON_RED = path.join(PUBLIC_ROOT, 'rupee-red.png');

    // Calculate starting X coordinates for columns
    let columnStart = MARGIN_X;
    tableColumns.forEach(col => {
      col.x = columnStart;
      columnStart += col.width;
    });

    // --- DRAW TABLE HEADERS ---
    doc.font('Helvetica-Bold').fontSize(12);
    doc.rect(MARGIN_X, tableY, PAGE_WIDTH, headerHeight).fillAndStroke('#f0f0f0', 'black');

    tableColumns.forEach(col => {
      doc.fillColor('black')
        .text(col.name, col.x, tableY + 10, { width: col.width, align: col.align });
    });

    // Draw vertical column separators
    let currentSeparatorX = MARGIN_X;
    tableColumns.forEach((col, index) => {
      if (index > 0) {
        doc.moveTo(currentSeparatorX, tableY).lineTo(currentSeparatorX, tableY + headerHeight).stroke('black');
      }
      currentSeparatorX += col.width;
    });

    let dataY = tableY + headerHeight;
    const dataRows = data.lrs

    for (let i = 0; i < dataRows.length; i++) {
      const rowData = dataRows[i];

      doc.rect(MARGIN_X, dataY, PAGE_WIDTH, rowHeight).stroke('black');
      doc.font('Helvetica-Bold').fontSize(12);

      tableColumns.forEach((col, colIndex) => {
        let textValue = rowData[col.field] || '';

        if (col.field === 'weight' && textValue) {
          textValue += ' MT';
        }

        doc.fillColor('black');

        if ((col.field === 'rate' || col.field === 'freight') && textValue) {
          doc.image(RUPEE_ICON, col.x + 15, dataY + 10, {
            width: RUPEE_ICON_SIZE,
            height: RUPEE_ICON_SIZE,
          });

          doc.text(textValue, col.x + 15, dataY + 11, {
            width: col.width - (RUPEE_ICON_SIZE + 6),
            align: col.align
          });
        } else {
          doc.text(textValue, col.x + 2, dataY + 11, {
            width: col.width - 4,
            align: col.align
          });
        }

        if (colIndex < tableColumns.length - 1) {
          doc.moveTo(col.x + col.width, dataY)
            .lineTo(col.x + col.width, dataY + rowHeight)
            .stroke('black');
        }
      });

      dataY += rowHeight;
    }

    currentY = dataY;

    // --- 7. FINAL BOTTOM SECTION ---

    const finalY = currentY;
    const finalHeight = 125;

    doc.rect(MARGIN_X, finalY, PAGE_WIDTH, finalHeight + 5).stroke('black');
    // Draw major internal separators
    const COL1_END = MARGIN_X + 390; // Invoice/eWayBill

    // vertical lines
    doc.moveTo(COL1_END, finalY).lineTo(COL1_END, finalY + finalHeight + 5).stroke('black');
    doc.moveTo(COL1_END + 70, finalY).lineTo(COL1_END + 70, finalY + 130).stroke('black');

    doc.moveTo(COL1_END, finalY + 25).lineTo(PAGE_WIDTH + 30, finalY + 25).stroke('black');
    doc.moveTo(MARGIN_X, finalY + 50).lineTo(PAGE_WIDTH + 30, finalY + 50).stroke('black');
    doc.moveTo(COL1_END, finalY + 75).lineTo(PAGE_WIDTH + 30, finalY + 75).stroke('black');
    doc.moveTo(COL1_END, finalY + 100).lineTo(PAGE_WIDTH + 30, finalY + 100).stroke('black');


    // Col 1: E-Way/Invoice/Bank Details
    try {
      data.billDetails.halting.length > 0 ?
        (doc.image(RUPEE_ICON, MARGIN_X + 472, currentY + 7, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        })) : null;
      data.billDetails.extra.length > 0 ?
        doc.image(RUPEE_ICON, MARGIN_X + 472, currentY + 30, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        }) : null;
      data.billDetails.total.length > 0 ?
        doc.image(RUPEE_ICON_RED, MARGIN_X + 472, currentY + 56, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        }) : null;
      data.billDetails.advance.length > 0 ?
        doc.image(RUPEE_ICON, MARGIN_X + 472, currentY + 81, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        }) : null;
      data.billDetails.balance.length > 0 ?
        doc.image(RUPEE_ICON_RED, MARGIN_X + 472, currentY + 109, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        }) : null;
    } catch (e) {
      // Draw a placeholder box if logo is missing
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text(`Note ${data.note1}`, MARGIN_X + 5, finalY + 22);
    doc.text(`Halting`, COL1_END + 15, finalY + 9);
    doc.text(`${data.billDetails.halting.length > 0 ? data.billDetails.halting : "   -"}`, COL1_END + 95, finalY + 9);
    doc.text(`Extra`, COL1_END + 15, finalY + 32);
    doc.text(`${data.billDetails.extra.length > 0 ? data.billDetails.extra : "   -"}`, COL1_END + 95, finalY + 32);
    doc.text(`Total `, COL1_END + 15, finalY + 58);
    (data.billDetails.total.length > 0 ? doc.fillColor("red") : doc.fillColor("black")).text(`${data.billDetails.total.length > 0 ? data.billDetails.total : "   -"}`, COL1_END + 95, finalY + 58).fillColor("black");
    doc.text(`Advance `, COL1_END + 15, finalY + 83);
    doc.text(`${data.billDetails.advance.length > 0 ? data.billDetails.advance : "   -"}`, COL1_END + 95, finalY + 83);
    doc.text(`Balance `, COL1_END + 15, finalY + 111)
    doc.fillColor(`${data.billDetails.balance.length > 0 ? "red" : "black"}`).text(`${data.billDetails.balance.length > 0 ? data.billDetails.balance : "   -"}`, COL1_END + 95, finalY + 111).fillColor("black")

    doc.text(`Note: ${data.note2}`, MARGIN_X + 5, finalY + 90);

    // Col 2: Terms and Conditions
    doc.fontSize(11);
    doc.text(`HDFC A/C:  50200098240792 `, MARGIN_X + 5, finalY + finalHeight + 20);
    doc.text(`IFSC CODE: HDFC0003692 `, MARGIN_X + 5, finalY + finalHeight + 40);
    doc.text(`PAN No:      AHSPB6197L `, MARGIN_X + 5, finalY + finalHeight + 60);
    doc.moveTo(COL1_END - 80, finalY + finalHeight + 5).lineTo(COL1_END - 80, finalY + finalHeight + 80).stroke('black');
    doc.moveTo(MARGIN_X, finalY + finalHeight + 80).lineTo(PAGE_WIDTH + 30, finalY + finalHeight + 80).stroke('black');

    // Col 3/4: Balance / To Pay / Stamp

    // Digital Stamp Area
    if (data.includeDigitalStamp) {
      const STAMP_PATH = path.join(PUBLIC_ROOT, 'stamp.jpg');
      try {
        // Replace with your actual stamp path
        doc.image(STAMP_PATH, COL1_END + 70, finalY + finalHeight + 10, { width: 50, height: 50 });
      } catch (e) {
        // Placeholder box if image is missing
        doc.rect(COL1_END + 20, finalY + 55, 40, 40).stroke();
      }
    }

    // For: Bhandal Roadways
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black');
    doc.text(`For, BHANDAL ROADWAYS`, COL1_END + 15, finalY + finalHeight + 65, { width: 125, align: 'right' });


    // Col 2 Bottom: GST Tax Paid By Checkboxes (Manual Boxes)

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});



// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





