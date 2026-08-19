const PDFDocument = require('pdfkit');

function renderInvoicePdf(res, { invoice, client, project, settings }) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    doc.fillColor('#0b2545').fontSize(20).text(settings.site_name || 'Moquegua Soft', { continued: false });
    doc.fillColor('#6c7a89').fontSize(10)
        .text(settings.address || '')
        .text(settings.phone || '')
        .text(settings.email || '');

    doc.moveDown(1.5);
    doc.fillColor('#0b2545').fontSize(16).text(`Comprobante ${invoice.number}`, { align: 'right' });
    doc.fillColor('#6c7a89').fontSize(10).text(`Fecha de emisión: ${invoice.issue_date}`, { align: 'right' });
    doc.text(`Estado: ${invoice.status}`, { align: 'right' });

    doc.moveDown(1.5);
    doc.strokeColor('#e2e6ea').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    doc.fillColor('#0b2545').fontSize(12).text('Cliente', { underline: true });
    doc.fillColor('#333').fontSize(11)
        .text(client ? client.name : 'Cliente no especificado')
        .text(client && client.company ? client.company : '')
        .text(client && client.email ? client.email : '')
        .text(client && client.phone ? client.phone : '');

    if (project) {
        doc.moveDown(0.5);
        doc.fillColor('#0b2545').fontSize(12).text('Proyecto', { underline: true });
        doc.fillColor('#333').fontSize(11).text(project.name);
    }

    doc.moveDown(1.2);
    doc.strokeColor('#e2e6ea').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    const tableTop = doc.y;
    doc.fillColor('#0b2545').fontSize(11)
        .text('Concepto', 50, tableTop, { width: 350 })
        .text('Monto', 420, tableTop, { width: 125, align: 'right' });
    doc.moveDown(0.5);
    doc.strokeColor('#e2e6ea').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const rowY = doc.y;
    doc.fillColor('#333').fontSize(11).text(invoice.concept, 50, rowY, { width: 350 });
    doc.fillColor('#333').fontSize(11).text(`${invoice.currency} ${invoice.amount.toFixed(2)}`, 420, rowY, { width: 125, align: 'right' });

    doc.moveDown(1.5);
    doc.strokeColor('#e2e6ea').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fillColor('#0b2545').fontSize(13)
        .text(`Total: ${invoice.currency} ${invoice.amount.toFixed(2)}`, { align: 'right' });

    doc.moveDown(3);
    doc.fillColor('#6c7a89').fontSize(9)
        .text('Este comprobante fue generado automáticamente por el panel administrativo de Moquegua Soft.', { align: 'center' });

    doc.end();
}

module.exports = { renderInvoicePdf };
