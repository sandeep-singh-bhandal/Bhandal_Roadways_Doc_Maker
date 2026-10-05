import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { drawBiltyPage, getImgBuffer } from "./drawBilty.js";

const app = express();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bhandal-roadways-doc-maker.vercel.app",
    ],
  }),
);

app.use("/static", express.static(path.join(process.cwd(), "public")));

app.get("/status", (req, res) => {
  res.json({
    success: true,
    msg: "Bhandal Roadways PDF Generator API is running.",
  });
});

// Generate PDF Route
app.post("/generate-pdf", async (req, res) => {
  const { biltyData } = req.body;
  try {
    const doc = new PDFDocument({ size: "A4", margin: 20 });

    // 1. Fetch and Register Font First
    const fontUrl =
      "https://res.cloudinary.com/dybupgtfs/raw/upload/v1774427557/impact_mfhgdd.ttf";
    const fontBuffer = await getImgBuffer(fontUrl);

    if (fontBuffer) {
      doc.registerFont("Impact", fontBuffer);
    }

    // 2. Set Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="bilty.pdf"`);

    // 3. Pipe to response
    doc.pipe(res);

    // 4. CRITICAL: Use AWAIT for every drawing call
    await drawBiltyPage(doc, biltyData, "Driver Copy");
    doc.addPage();
    await drawBiltyPage(doc, biltyData, "Consignee Copy");
    doc.addPage();
    await drawBiltyPage(doc, biltyData, "Consignor Copy");

    // 5. End the document
    doc.end();

    // 6. Vercel/Express Safety: Wait for the stream to fully flush
    await new Promise((resolve) => res.on("finish", resolve));
  } catch (err) {
    console.error("PDF Generation Error:", err);
    if (!res.headersSent) res.status(500).send("Error generating PDF");
  }
});

app.post("/generate-bill-pdf", async (req, res) => {
  const { billData } = req.body;

  try {
    const data = billData;

    const date = new Date().toLocaleDateString("en-GB");

    // =========================================================
    // CLOUDINARY ASSETS
    // SAME URLs AS BILTY PAGE
    // =========================================================

    const LOGO_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427591/logo_yehw0q.png";

    const PHONE_ICON_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427590/phone_yopprj.png";

    const LOCATION_ICON_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427589/location_wtqkq9.png";

    const MAIL_ICON_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427590/mail_u76gp3.png";

    const STAMP_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427579/stamp_kw0ine.jpg";

    const FONT_URL =
      "https://res.cloudinary.com/dybupgtfs/raw/upload/v1774427557/impact_mfhgdd.ttf";

    const RUPEE_ICON_URL =
      "https://res.cloudinary.com/dybupgtfs/image/upload/v1774427590/rupee_r1konz.png";

    // Bilty page code me in dono ke Cloudinary URLs nahi diye gaye the.
    // Inhe apne actual Cloudinary URLs se replace kar dena.

    // =========================================================
    // CLOUDINARY BUFFER HELPER
    // =========================================================

    const getImgBuffer = async (url) => {
      if (!url) return null;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        return Buffer.from(arrayBuffer);
      } catch (error) {
        console.error(`Cloudinary Fetch Error for ${url}:`, error.message);

        return null;
      }
    };

    // =========================================================
    // FETCH ALL ASSETS
    // =========================================================

    const [
      logoBuffer,
      phoneIconBuffer,
      locationIconBuffer,
      mailIconBuffer,
      stampBuffer,
      fontBuffer,
      rupeeIconBuffer,
    ] = await Promise.all([
      getImgBuffer(LOGO_URL),
      getImgBuffer(PHONE_ICON_URL),
      getImgBuffer(LOCATION_ICON_URL),
      getImgBuffer(MAIL_ICON_URL),
      getImgBuffer(STAMP_URL),
      getImgBuffer(FONT_URL),
      getImgBuffer(RUPEE_ICON_URL),
    ]);

    const doc = new PDFDocument({
      size: "A4",
      margin: 20,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="bill.pdf"`);

    doc.pipe(res);

    // =========================================================
    // BASIC SETTINGS
    // =========================================================

    const MARGIN_X = 30;
    const PAGE_WIDTH = 595.28 - MARGIN_X * 2;

    let currentY = 30;

    // Register custom font
    if (fontBuffer) {
      try {
        doc.registerFont("Impact", fontBuffer);
      } catch (e) {
        console.warn("Custom font registration failed");
      }
    }

    // =========================================================
    // HEADER
    // =========================================================

    // IMPORTANT:
    // Outer border is NOT drawn here anymore.
    // It will be drawn at the very end based on finalY.
    // This makes the bottom line dynamic according to LR count.

    // ---------------------------------------------------------
    // LOGO
    // ---------------------------------------------------------

    const LOGO_SIZE = 80;

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, MARGIN_X + 10, currentY + 5, {
          width: LOGO_SIZE,
          height: LOGO_SIZE,
        });
      } catch (e) {
        doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
      }
    } else {
      doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }

    // ---------------------------------------------------------
    // TITLE
    // ---------------------------------------------------------

    doc
      .font("Impact")
      .fontSize(36)
      .text("BHANDAL ROADWAYS", MARGIN_X + 80, currentY + 2, {
        width: PAGE_WIDTH - 160,
        align: "center",
      });

    // ---------------------------------------------------------
    // PHONE ICON
    // ---------------------------------------------------------

    const PHONE_ICON_SIZE = 14;

    if (phoneIconBuffer) {
      try {
        doc.image(phoneIconBuffer, MARGIN_X + 435, currentY + 11, {
          width: PHONE_ICON_SIZE,
          height: PHONE_ICON_SIZE,
        });
      } catch (e) {
        // Ignore missing icon
      }
    }

    // ---------------------------------------------------------
    // CONTACT NUMBERS
    // ---------------------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("black")
      .text("+91 93016 76383", PAGE_WIDTH - 55, currentY + 14, {
        align: "left",
      });

    doc.text("+91 94060 21740", PAGE_WIDTH - 55, currentY + 26, {
      align: "left",
    });

    doc.text("+91 62612 94248", PAGE_WIDTH - 55, currentY + 38, {
      align: "left",
    });

    // ---------------------------------------------------------
    // SUBTITLE
    // ---------------------------------------------------------

    currentY += 45;

    const textContent = "TRANSPORT CONTRACTOR & COMMISSION AGENT";

    const fontSize = 10;
    const paddingY = 3;
    const lineHeight = fontSize * 1.2;

    const boxX = MARGIN_X + 110;
    const boxY = currentY - paddingY + 3;
    const boxWidth = PAGE_WIDTH - 220;
    const boxHeight = lineHeight + 2 * paddingY;

    doc.fillColor("black").rect(boxX, boxY, boxWidth, boxHeight).fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(fontSize)
      .fillColor("white")
      .text(textContent, MARGIN_X, currentY + 6, {
        align: "center",
        width: PAGE_WIDTH,
      });

    currentY += 15;

    doc.fillColor("black");

    // ---------------------------------------------------------
    // LOCATION
    // ---------------------------------------------------------

    const LOCATION_ICON_SIZE = 15;

    if (locationIconBuffer) {
      try {
        doc.image(locationIconBuffer, MARGIN_X + 85, currentY + 5, {
          width: LOCATION_ICON_SIZE,
          height: LOCATION_ICON_SIZE,
        });
      } catch (e) {
        // Ignore missing icon
      }
    }

    currentY += 10;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("black")
      .text(
        "House No: 21, Harshit Vihar, Phase 05, Tatibandh, RAIPUR: 492099 (C.G)",
        MARGIN_X,
        currentY,
        {
          align: "center",
        },
      );

    // ---------------------------------------------------------
    // EMAIL
    // ---------------------------------------------------------

    currentY += 16;

    const MAIL_ICON_SIZE = 14;

    if (mailIconBuffer) {
      try {
        doc.image(mailIconBuffer, MARGIN_X + 185, currentY - 4, {
          width: MAIL_ICON_SIZE,
          height: MAIL_ICON_SIZE,
        });
      } catch (e) {
        // Ignore missing icon
      }
    }

    doc
      .font("Helvetica")
      .fontSize(10)
      .text("bhandalroadways@gmail.com", MARGIN_X, currentY - 1, {
        align: "center",
      });

    // ---------------------------------------------------------
    // TRANSPORTER ID
    // ---------------------------------------------------------

    currentY += 15;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Transporter ID: 22AHSPB6197L1ZV", MARGIN_X, currentY, {
        align: "center",
      });

    // ---------------------------------------------------------
    // TRANSPORTING BILL
    // ---------------------------------------------------------

    currentY += 20;

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .fillColor("red")
      .text("TRANSPORTING BILL", MARGIN_X - 15, currentY + 2, {
        align: "center",
      });

    doc
      .moveTo(MARGIN_X, 190)
      .lineTo(PAGE_WIDTH + 30, 190)
      .stroke();

    currentY += 40;

    // =========================================================
    // LR / DATE / RECIPIENT
    // =========================================================

    const box1Y = currentY + 8;
    const box1Height = 50;

    // ---------------------------------------------------------
    // LR NUMBER
    // ---------------------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("black")
      .text("No:", MARGIN_X + 5, box1Y);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("red")
      .text(data.billNo, MARGIN_X + 25, box1Y - 2);

    // ---------------------------------------------------------
    // DATE
    // ---------------------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text("Date:", MARGIN_X + 50 + PAGE_WIDTH - 150, box1Y);

    doc.text(date, MARGIN_X + 50 + PAGE_WIDTH - 120, box1Y);

    // ---------------------------------------------------------
    // TO / RECIPIENT NAME
    // ---------------------------------------------------------

    let receipientX = MARGIN_X + 5;

    doc.text("To:", receipientX, box1Y + 23);

    const recipientNameX = receipientX + 20;

    const recipientName = String(data.receipientName || "");

    doc.text(recipientName, recipientNameX, box1Y + 23);

    // Recipient name underline

    const recipientNameWidth = doc.widthOfString(recipientName);

    doc
      .moveTo(recipientNameX, box1Y + 36)
      .lineTo(recipientNameX + recipientNameWidth, box1Y + 36)
      .stroke();

    // ---------------------------------------------------------
    // RECIPIENT ADDRESS
    // ---------------------------------------------------------

    const recipientAddress = String(data.receipientAddress || "");

    doc.text(recipientAddress, receipientX, box1Y + 43, {
      width: PAGE_WIDTH - 5,
    });

    // Address underline

    const recipientAddressWidth = doc.widthOfString(recipientAddress);

    const maxAddressWidth = PAGE_WIDTH - 5;

    const addressUnderlineWidth = Math.min(
      recipientAddressWidth,
      maxAddressWidth,
    );

    doc
      .moveTo(receipientX, box1Y + 56)
      .lineTo(receipientX + addressUnderlineWidth, box1Y + 56)
      .stroke();

    // ---------------------------------------------------------
    // MOVE DOWN BASED ON ADDRESS LENGTH
    // ---------------------------------------------------------

    currentY = box1Y + box1Height + (recipientAddress.length > 100 ? 40 : 20);

    // Horizontal separator

    doc
      .moveTo(MARGIN_X, currentY - 10)
      .lineTo(PAGE_WIDTH + 30, currentY - 10)
      .stroke();

    // Vertical separator

    doc
      .moveTo((PAGE_WIDTH + 60) / 2, currentY - 10)
      .lineTo((PAGE_WIDTH + 60) / 2, currentY + box1Height + 30)
      .stroke();

    // =========================================================
    // VEHICLE / THROUGH / FROM / TO
    // =========================================================

    const consigY = currentY;
    const consigHeight = 50;

    doc.font("Helvetica-Bold").fontSize(12).fillColor("black");

    // ---------------------------------------------------------
    // LEFT SIDE
    // ---------------------------------------------------------

    let consigX = MARGIN_X + 5;

    // Vehicle No.

    doc.text("Vehicle No:", consigX, currentY + 8);

    const vehicleX = consigX + 66;

    const vehicleText = String(data.vehicleNo || "");

    doc.text(vehicleText, vehicleX, currentY + 8);

    // Vehicle underline

    const vehicleWidth = doc.widthOfString(vehicleText);

    doc
      .moveTo(vehicleX, currentY + 21)
      .lineTo(vehicleX + vehicleWidth, currentY + 21)
      .stroke();

    // ---------------------------------------------------------
    // THROUGH
    // ---------------------------------------------------------

    doc.text("Through:", consigX, currentY + 32);

    const throughX = consigX + 54;

    const throughText = String(data.through || "");

    doc.text(throughText, throughX, currentY + 32);

    // Through underline

    const throughWidth = doc.widthOfString(throughText);

    doc
      .moveTo(throughX, currentY + 45)
      .lineTo(throughX + throughWidth, currentY + 45)
      .stroke();

    // ---------------------------------------------------------
    // RIGHT SIDE
    // ---------------------------------------------------------

    consigX = MARGIN_X + PAGE_WIDTH / 2 + 5;

    // From

    doc.text("From:", consigX, currentY + 8);

    const fromX = consigX + 34;

    const fromText = String(data.from || "");

    doc.text(fromText, fromX, currentY + 8);

    // From underline

    const fromWidth = doc.widthOfString(fromText);

    doc
      .moveTo(fromX, currentY + 21)
      .lineTo(fromX + fromWidth, currentY + 21)
      .stroke();

    // ---------------------------------------------------------
    // TO
    // ---------------------------------------------------------

    doc.text("To:", consigX, currentY + 32);

    const toX = consigX + 20;

    const toText = String(data.to || "");

    doc.text(toText, toX, currentY + 32);

    // To underline

    const toWidth = doc.widthOfString(toText);

    doc
      .moveTo(toX, currentY + 45)
      .lineTo(toX + toWidth, currentY + 45)
      .stroke();

    currentY = consigY + consigHeight;

    // =========================================================
    // PACKAGE DATA TABLE
    // =========================================================

    const tableY = currentY + 10;

    const rowHeight = 30;
    const headerHeight = 30;

    // ---------------------------------------------------------
    // TABLE COLUMNS
    // ---------------------------------------------------------

    const tableColumns = [
      {
        name: "LR No.",
        width: 60,
        align: "center",
        field: "lrNo",
      },
      {
        name: "Date",
        width: 80,
        align: "center",
        field: "date",
      },
      {
        name: "Invoice No.",
        width: 100,
        align: "center",
        field: "invoiceNo",
      },
      {
        name: "Weight",
        width: 75,
        align: "center",
        field: "weight",
      },
      {
        name: "Charge Wt.",
        width: 75,
        align: "center",
        field: "chargeWeight",
      },
      {
        name: "Rate",
        width: 70,
        align: "center",
        field: "rate",
      },
      {
        name: "Freight",
        width: 75,
        align: "center",
        field: "freight",
      },
    ];

    const RUPEE_ICON_SIZE = 12;

    // =========================================================
    // COLUMN X POSITIONS
    // =========================================================

    let columnStart = MARGIN_X;

    tableColumns.forEach((col) => {
      col.x = columnStart;
      columnStart += col.width;
    });

    // =========================================================
    // TABLE HEADER
    // =========================================================

    doc.font("Helvetica-Bold").fontSize(12).fillColor("black");

    doc
      .rect(MARGIN_X, tableY, PAGE_WIDTH, headerHeight)
      .fillAndStroke("#f0f0f0", "black");

    tableColumns.forEach((col) => {
      doc.fillColor("black").text(col.name, col.x, tableY + 10, {
        width: col.width,
        align: col.align,
      });
    });

    // ---------------------------------------------------------
    // HEADER VERTICAL LINES
    // ---------------------------------------------------------

    let currentSeparatorX = MARGIN_X;

    tableColumns.forEach((col, index) => {
      if (index > 0) {
        doc
          .moveTo(currentSeparatorX, tableY)
          .lineTo(currentSeparatorX, tableY + headerHeight)
          .stroke("black");
      }

      currentSeparatorX += col.width;
    });

    // =========================================================
    // TABLE DATA
    // =========================================================

    let dataY = tableY + headerHeight;

    const dataRows = data.lrs || [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowData = dataRows[i];

      // Row border

      doc.rect(MARGIN_X, dataY, PAGE_WIDTH, rowHeight).stroke("black");

      tableColumns.forEach((col, colIndex) => {
        let textValue = rowData[col.field] || "";

        textValue = String(textValue);

        // Weight

        if (col.field === "weight" && textValue) {
          textValue += " MT";
        }

        doc.fillColor("black");

        // =================================================
        // DYNAMIC INVOICE FONT SIZE
        // =================================================

        let fontSize = 12;

        if (col.field === "invoiceNo") {
          const invoiceLength = textValue.length;

          if (invoiceLength > 18) {
            fontSize = 8;
          } else if (invoiceLength > 15) {
            fontSize = 9;
          } else if (invoiceLength > 12) {
            fontSize = 10;
          } else if (invoiceLength > 10) {
            fontSize = 11;
          }
        }

        doc.font("Helvetica-Bold").fontSize(fontSize);

        // =================================================
        // RATE / FREIGHT
        // =================================================

        if ((col.field === "rate" || col.field === "freight") && textValue) {
          if (rupeeIconBuffer) {
            try {
              doc.image(rupeeIconBuffer, col.x + 15, dataY + 10, {
                width: RUPEE_ICON_SIZE,
                height: RUPEE_ICON_SIZE,
              });
            } catch (e) {
              // Ignore missing icon
            }
          }

          doc.text(textValue, col.x + 15, dataY + 11, {
            width: col.width - (RUPEE_ICON_SIZE + 6),
            align: col.align,
            lineBreak: false,
          });
        } else {
          // =================================================
          // NORMAL TEXT
          // =================================================

          doc.text(textValue, col.x + 2, dataY + 11, {
            width: col.width - 4,
            align: col.align,
            lineBreak: false,
          });
        }

        // -------------------------------------------------
        // COLUMN SEPARATOR
        // -------------------------------------------------

        if (colIndex < tableColumns.length - 1) {
          doc
            .moveTo(col.x + col.width, dataY)
            .lineTo(col.x + col.width, dataY + rowHeight)
            .stroke("black");
        }
      });

      dataY += rowHeight;
    }

    // =========================================================
    // CURRENT Y NOW AUTOMATICALLY DEPENDS ON LR COUNT
    // =========================================================

    currentY = dataY;

    // =========================================================
    // FINAL BOTTOM SECTION
    // =========================================================

    const finalY = currentY;

    const finalHeight = 125;

    doc.rect(MARGIN_X, finalY, PAGE_WIDTH, finalHeight + 5).stroke("black");

    // ---------------------------------------------------------
    // FINAL SECTION COLUMNS
    // ---------------------------------------------------------

    const COL1_END = MARGIN_X + 390;

    // Vertical lines

    doc
      .moveTo(COL1_END, finalY)
      .lineTo(COL1_END, finalY + finalHeight + 5)
      .stroke("black");

    doc
      .moveTo(COL1_END + 70, finalY)
      .lineTo(COL1_END + 70, finalY + 130)
      .stroke("black");

    // Horizontal lines

    doc
      .moveTo(COL1_END, finalY + 25)
      .lineTo(PAGE_WIDTH + 30, finalY + 25)
      .stroke("black");

    doc
      .moveTo(MARGIN_X, finalY + 50)
      .lineTo(PAGE_WIDTH + 30, finalY + 50)
      .stroke("black");

    doc
      .moveTo(COL1_END, finalY + 75)
      .lineTo(PAGE_WIDTH + 30, finalY + 75)
      .stroke("black");

    doc
      .moveTo(COL1_END, finalY + 100)
      .lineTo(PAGE_WIDTH + 30, finalY + 100)
      .stroke("black");

    // =========================================================
    // RUPEE ICONS
    // =========================================================

    try {
      if (
        String(data.billDetails?.halting || "").length > 0 &&
        rupeeIconBuffer
      ) {
        doc.image(rupeeIconBuffer, MARGIN_X + 472, currentY + 7, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        });
      }

      if (String(data.billDetails?.extra || "").length > 0 && rupeeIconBuffer) {
        doc.image(rupeeIconBuffer, MARGIN_X + 472, currentY + 30, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        });
      }

      if (
        String(data.billDetails?.total || "").length > 0 &&
        rupeeIconBuffer
      ) {
        doc.image(rupeeIconBuffer, MARGIN_X + 472, currentY + 56, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        });
      }

      if (
        String(data.billDetails?.advance || "").length > 0 &&
        rupeeIconBuffer
      ) {
        doc.image(rupeeIconBuffer, MARGIN_X + 472, currentY + 81, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        });
      }

      if (
        String(data.billDetails?.balance || "").length > 0 &&
        rupeeIconBuffer
      ) {
        doc.image(rupeeIconBuffer, MARGIN_X + 472, currentY + 109, {
          width: RUPEE_ICON_SIZE,
          height: RUPEE_ICON_SIZE,
        });
      }
    } catch (e) {
      // Ignore missing icons
    }

    // =========================================================
    // BILL DETAILS
    // =========================================================

    const billDetails = data.billDetails || {};

    const halting = String(billDetails.halting || "");

    const extra = String(billDetails.extra || "");

    const total = String(billDetails.total || "");

    const advance = String(billDetails.advance || "");

    const balance = String(billDetails.balance || "");

    doc.font("Helvetica-Bold").fontSize(11).fillColor("black");

    // Note 1

    doc.text(`Note ${data.note1 || ""}`, MARGIN_X + 5, finalY + 22);

    // Halting

    doc.text("Halting", COL1_END + 15, finalY + 9);

    doc.text(halting.length > 0 ? halting : "   -", COL1_END + 95, finalY + 9);

    // Extra

    doc.text("Extra", COL1_END + 15, finalY + 32);

    doc.text(extra.length > 0 ? extra : "   -", COL1_END + 95, finalY + 32);

    // Total

    doc.text("Total", COL1_END + 15, finalY + 58);

    doc
      .text(total.length > 0 ? total : "   -", COL1_END + 95, finalY + 58)
      .fillColor("black");

    // Advance

    doc.text("Advance", COL1_END + 15, finalY + 83);

    doc.text(advance.length > 0 ? advance : "   -", COL1_END + 95, finalY + 83);

    // Balance

    doc.text("Balance", COL1_END + 15, finalY + 111);

    doc
      .text(balance.length > 0 ? balance : "   -", COL1_END + 95, finalY + 111)
      .fillColor("black");

    // Note 2

    doc.text(`Note: ${data.note2 || ""}`, MARGIN_X + 5, finalY + 90);

    // =========================================================
    // BANK DETAILS
    // =========================================================

    doc.fontSize(11);

    doc.text(
      "HDFC A/C:  50200098240792",
      MARGIN_X + 5,
      finalY + finalHeight + 20,
    );

    doc.text("IFSC CODE: HDFC0003692", MARGIN_X + 5, finalY + finalHeight + 40);

    doc.text(
      "PAN No:      AHSPB6197L",
      MARGIN_X + 5,
      finalY + finalHeight + 60,
    );

    doc
      .moveTo(COL1_END - 80, finalY + finalHeight + 5)
      .lineTo(COL1_END - 80, finalY + finalHeight + 80)
      .stroke("black");

    // =========================================================
    // BOTTOM HORIZONTAL LINE
    // =========================================================

    const bottomLineY = finalY + finalHeight + 80;

    doc
      .moveTo(MARGIN_X, bottomLineY)
      .lineTo(PAGE_WIDTH + 30, bottomLineY)
      .stroke("black");

    // =========================================================
    // DIGITAL STAMP
    // =========================================================

    if (data.includeDigitalStamp) {
      try {
        if (stampBuffer) {
          doc.image(stampBuffer, COL1_END + 70, finalY + finalHeight + 10, {
            width: 50,
            height: 50,
          });
        } else {
          doc.rect(COL1_END + 20, finalY + 55, 40, 40).stroke();
        }
      } catch (e) {
        doc.rect(COL1_END + 20, finalY + 55, 40, 40).stroke();
      }
    }

    // =========================================================
    // FOR BHANDAL ROADWAYS
    // =========================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text("For, BHANDAL ROADWAYS", COL1_END + 15, finalY + finalHeight + 65, {
        width: 125,
        align: "right",
      });

    // =========================================================
    // DYNAMIC OUTER BORDER
    // =========================================================

    const outerBorderTop = 30 - 6;

    const outerBorderBottom = bottomLineY;

    const outerBorderHeight = outerBorderBottom - outerBorderTop;

    doc
      .rect(MARGIN_X, outerBorderTop, PAGE_WIDTH, outerBorderHeight)
      .stroke("black");

    // =========================================================
    // END PDF
    // =========================================================

    doc.end();
  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).send("Error generating PDF");
    }
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
