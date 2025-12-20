import path from 'path';
export const drawBiltyPage = (doc, data, copyLabel) => {

    const MARGIN_X = 30;
    const PAGE_WIDTH = 595.28 - MARGIN_X * 2;
    let currentY = 30;

    doc.fillColor('black');
    const PUBLIC_ROOT = path.join(process.cwd(), 'public');

    const date = new Date().toLocaleDateString("en-GB");
    const totalWeight = data.packages.reduce((acc, item) => acc + (Number(item.weight) || 0), 0).toFixed(3);


    // --- 2. TOP HEADER (LOGO, TITLE, CONTACTS) ---

    // Logo (Approximate Positioning)
    const LOGO_SIZE = 80;
    const LOGO_PATH = path.join(PUBLIC_ROOT, 'logo.png');
    try {
        doc.image(LOGO_PATH, MARGIN_X, currentY, {
            width: LOGO_SIZE,
            height: LOGO_SIZE,
        });
    } catch (e) {
        // Draw a placeholder box if logo is missing
        doc.rect(MARGIN_X, currentY, LOGO_SIZE, LOGO_SIZE).stroke();
    }

    doc
        .fontSize(10)
        .text('Subject to Raipur Jurisdiction', MARGIN_X + 80, currentY - 7, {
            width: PAGE_WIDTH - 160,
            align: 'center',

        });
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
        doc.image(PHONE_ICON, MARGIN_X + 450, currentY - 4, {
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
        .text('+91 93016 76383', PAGE_WIDTH - 60, currentY, { align: 'right' });
    doc.text('+91 94060 21740', PAGE_WIDTH - 60, currentY + 12, { align: 'right' });
    doc.text('+91 62612 94248', PAGE_WIDTH - 60, currentY + 24, { align: 'right' });

    // Sub-Title and Address
    currentY += 45;
    const textContent = 'TRANSPORT CONTRACTOR & COMMISSION AGENT';

    // The font metrics (approximations for padding)
    const fontSize = 10;
    const paddingY = 3; // Vertical padding
    const lineHeight = fontSize * 1.2; // Approximate line height

    const boxX = MARGIN_X + 90;
    const boxY = currentY - paddingY + 3; // Shift up by paddingY
    const boxWidth = PAGE_WIDTH - 180;
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
        doc.image(LOCATION_ICON, MARGIN_X + 85, currentY + 6, {
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
        .text('bhandalroadways@gmail.com', MARGIN_X, currentY, { align: 'center' });

    currentY += 15;
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .text(`Transporter ID: 22AHSPB6197L1ZV`, MARGIN_X, currentY, { align: 'center' });

    currentY += 20;
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('red')
        .text(copyLabel, MARGIN_X - 15, currentY, { align: 'center' });

    currentY += 20;


    // --- 3. LR & DATE / FROM & TO BOX ---

    const box1Y = currentY;
    const box1Height = 50;

    // Draw main box border

    // LR No. (Top Left)
    doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('black')
        .text('L.R No:', MARGIN_X + 5, box1Y + 5);

    doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('red')
        .text(data.lrNo, MARGIN_X + 42, box1Y + 1);

    // Date (Top Right)
    doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('black')
        .text('Date:', MARGIN_X + 60 + PAGE_WIDTH - 150, box1Y + 5);
    doc.font('Helvetica-Bold')
        .text(date, MARGIN_X + 60 + PAGE_WIDTH - 120, box1Y + 5);

    // Truck No, From, To
    doc.font('Helvetica-Bold')
        .fontSize(9);

    doc.rect(MARGIN_X, currentY + 22, PAGE_WIDTH, 17).stroke();

    // Truck No
    let truckX = MARGIN_X + 5;
    doc.text('Truck No:', truckX, box1Y + 27);
    doc.text(data.truckNo, truckX + 44, box1Y + 27);
    doc.moveTo(MARGIN_X + 170, box1Y + 39).lineTo(MARGIN_X + 170, box1Y + 22).stroke();

    // From
    let fromX = MARGIN_X + 175;
    doc.text('From:', fromX, box1Y + 27);
    doc.text(data.from, fromX + 27, box1Y + 27, { width: 140 });
    doc.moveTo(MARGIN_X + 370, box1Y + 39).lineTo(MARGIN_X + 370, box1Y + 22).stroke();

    // To
    let toX = MARGIN_X + 375;
    doc.text('To:', toX, box1Y + 27);
    doc.text(data.to, toX + 16, box1Y + 27, { width: 180 });

    currentY = box1Y + box1Height;

    // --- 4. CONSIGNOR / CONSIGNEE BOX ---

    const consigY = (data.consignor.address.length > 86 || data.consignee.address.length > 86)
        ? currentY + 20
        : (data.consignor.address.length > 57 || data.consignee.address.length > 57)
            ? currentY + 10
            : currentY;
    const consigHeight = 70;


    // Left (Consignor)
    let consigX = MARGIN_X + 5;
    doc.font('Helvetica').fontSize(10);

    doc.text('Consignor:', consigX, currentY + 5);
    doc.font('Helvetica-Bold').text(data.consignor.name, consigX + 51, currentY + 5, { underline: true });

    doc.font('Helvetica').text('Address:', consigX, currentY + 23);
    doc.font('Helvetica-Bold').text(data.consignor.address.trim().split("\n").join(""), consigX + 41, currentY + 23, { width: PAGE_WIDTH / 2 - 70, underline:true });
    doc.font('Helvetica').text('GST No:', consigX, consigY + 52);
    doc.font('Helvetica-Bold').text(data.consignor.gstNumber, consigX + 41, consigY + 52, { underline: true });

    // Right (Consignee)
    consigX = MARGIN_X + PAGE_WIDTH / 2 + 5;

    doc.font('Helvetica').text('Consignee:', consigX, currentY + 5);
    doc.font('Helvetica-Bold').text(data.consignee.name, consigX + 51, currentY + 5, { underline: true });
    doc.font('Helvetica').text('Address:', consigX, currentY + 23);
    doc.font('Helvetica-Bold').text(data.consignee.address.trim().split("\n").join(""), consigX + 41, currentY + 23, { width: PAGE_WIDTH / 2 - 70 , underline:true});

    doc.font('Helvetica').text('GST No:', consigX, consigY + 52);
    doc.font('Helvetica-Bold').text(data.consignee.gstNumber, consigX + 41, consigY + 52, { underline: true });

    currentY = consigY + consigHeight;

    // --- 5. PACKAGE DATA TABLE ---
    const tableY = currentY + 10;
    const rowHeight = 18;
    const headerHeight = 20;

    // Define column layout (Total width = 535)
    const tableColumns = [
        { name: "S. No.", width: 45, align: 'center', field: 'index' },
        { name: "Description of Load", width: 230, align: 'center', field: 'description' },
        { name: "Quantity", width: 90, align: 'center', field: 'weight' },
        { name: "Rate", width: 85, align: 'center', field: 'rate' },
        { name: "FREIGHT", width: 85, align: 'center', field: 'freight' }
    ];

    // Calculate starting X coordinates for columns
    let columnStart = MARGIN_X;
    tableColumns.forEach(col => {
        col.x = columnStart;
        columnStart += col.width;
    });

    // --- DRAW TABLE HEADERS ---
    doc.font('Helvetica-Bold').fontSize(9);
    doc.rect(MARGIN_X, tableY, PAGE_WIDTH, headerHeight).fillAndStroke('#f0f0f0', 'black');

    tableColumns.forEach(col => {
        doc.fillColor('black')
            .text(col.name, col.x, tableY + 6, { width: col.width, align: col.align });
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
    const dataRows = data.packages // Take up to 3 for the main view

    for (let i = 0; i < dataRows.length; i++) {
        const rowData = dataRows[i];

        // Draw Row Border
        doc.rect(MARGIN_X, dataY, PAGE_WIDTH, rowHeight).stroke('black');

        doc.font('Helvetica-Bold').fontSize(9);

        tableColumns.forEach((col, colIndex) => {
            let textValue = '';

            if (col.field === 'index') {
                textValue = `${i + 1}.`;
            } else if (rowData) {
                textValue = rowData[col.field];
                if (col.field === 'weight' && textValue) textValue += ' MT';
            }

            doc.fillColor('black')
                .text(textValue, col.x + 2, dataY + 5, { width: col.width - 4, align: col.align });

            // Draw inner vertical line
            if (colIndex < tableColumns.length - 1) {
                doc.moveTo(col.x + col.width, dataY).lineTo(col.x + col.width, dataY + rowHeight).stroke('black');
            }
        });

        dataY += rowHeight;
    }

    currentY = dataY;

    // --- 6. TOTAL ROW ---
    const totalY = currentY;
    const totalRowHeight = 20;

    doc.rect(MARGIN_X, totalY, PAGE_WIDTH, totalRowHeight).stroke('black'); // Full border

    // Total Weight Cell
    const totalWeightX = tableColumns[2].x;
    const totalWeightWidth = tableColumns[2].width;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`Total: ${totalWeight} MT`, totalWeightX, totalY + 6, { width: totalWeightWidth, align: 'center' });

    // Draw vertical separators for other columns
    doc.moveTo(tableColumns[1].x, totalY).lineTo(tableColumns[1].x, totalY + totalRowHeight).stroke('black');
    doc.moveTo(tableColumns[2].x + totalWeightWidth, totalY).lineTo(tableColumns[2].x + totalWeightWidth, totalY + totalRowHeight).stroke('black');
    doc.moveTo(tableColumns[3].x + tableColumns[3].width, totalY).lineTo(tableColumns[3].x + tableColumns[3].width, totalY + totalRowHeight).stroke('black');


    currentY = totalY + totalRowHeight;

    // --- 7. FINAL BOTTOM SECTION ---

    const finalY = currentY;
    const finalHeight = 30;

    doc.rect(MARGIN_X, finalY, PAGE_WIDTH, finalHeight + 5).stroke('black');
    doc.rect(MARGIN_X, finalY + 35, PAGE_WIDTH, finalHeight * 2).stroke('black');
    doc.rect(MARGIN_X, finalY + 95, PAGE_WIDTH, finalHeight * 2.5).stroke('black');

    // Draw major internal separators
    const COL1_END = MARGIN_X + 140; // Invoice/eWayBill
    const COL2_END = COL1_END + 135; // Terms and Conditions
    const COL3_END = COL2_END + 90; // Balance / To Pay
    const COL4_END = COL3_END + 85; // Balance / To Pay

    doc.moveTo(COL1_END, finalY).lineTo(COL1_END, finalY + finalHeight + 140).stroke('black');
    doc.moveTo(COL2_END, finalY-20).lineTo(COL2_END, finalY + finalHeight + 65).stroke('black');
    doc.moveTo(COL3_END, finalY).lineTo(COL3_END, finalY + finalHeight + 5).stroke('black');
    doc.moveTo(COL4_END, finalY).lineTo(COL4_END, finalY + finalHeight + 65).stroke('black');
    doc.moveTo(COL3_END, finalY + finalHeight + 65).lineTo(COL3_END, finalY + finalHeight + 140).stroke('black');

    // Col 1: E-Way/Invoice/Bank Details
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`e-Way Bill: ${data.eWayBillNo}`, MARGIN_X + 5, finalY + 16);
    doc.text(`Invoice No: ${data.invoiceNo}`, MARGIN_X + 5, finalY + 50);
    doc.text(`Value: AS PER INVOICE`, MARGIN_X + 5, finalY + 70);

    doc.text(`HDFC A/C: 50200098240792`, MARGIN_X + 5, finalY + 120);
    doc.text(`IFSC CODE: HDFC0003692`, MARGIN_X + 5, finalY + 140);

    // Col 2: Terms and Conditions
    doc.fontSize(8);
    const terms = [
        "• The Goods are accepted for carrier subject to terms and condition overleaf.",
        "• We are only broker not responsible for any type of claim (i.e. theft, damage, shortage, leakage, brokerage etc)."
    ];
    let termsY = finalY + 5;
    terms.forEach(term => {
        doc.text(term, COL1_END + 5, termsY, { width: 125 });
        termsY += 36
    });

    // Col 3/4: Balance / To Pay / Stamp

    // Top Right (Balance)
    doc.font('Helvetica-Bold').fontSize(9).text('BALANCE', COL3_END, finalY + 13, { width: 90, align: 'center' });
    doc.text('AS PER DECIDED RATE', COL4_END, finalY + 10, { width: 90, align: 'center' });

    // Middle Right (To Pay)
    doc.fontSize(16)
    doc.text('TO PAY TOTAL', COL2_END + 5, finalY + finalHeight / 2 + 45, { width: 160, align: 'center' });

    // Digital Stamp Area
    if (data.includeDigitalStamp) {
        const STAMP_PATH = path.join(PUBLIC_ROOT, 'stamp.jpg');
        try {
            // Replace with your actual stamp path
            doc.image(STAMP_PATH, COL3_END + 70, finalY + 100, { width: 50, height: 50 });
        } catch (e) {
            // Placeholder box if image is missing
            doc.rect(COL3_END + 20, finalY + 55, 40, 40).stroke();
        }
    }

    // For: Bhandal Roadways
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black');
    doc.text(`For, BHANDAL ROADWAYS`, COL3_END + 40, finalY + finalHeight + 127, { width: 125, align: 'right' });


    // Col 2 Bottom: GST Tax Paid By Checkboxes (Manual Boxes)
    doc.font('Helvetica-Bold').fontSize(10).text('GST TAX WILL BE PAID BY', COL1_END + 20, finalY + 115, { align: 'center', width: 190 });

    doc.text('Consignor', COL1_END + 55, finalY + 130);
    doc.rect(COL1_END + 45, finalY + 130, 7, 7).stroke(); // Checkbox 1

    doc.text('Consignee', COL1_END + 150, finalY + 130);
    doc.rect(COL1_END + 140, finalY + 130, 7, 7).stroke(); // Checkbox 2


}