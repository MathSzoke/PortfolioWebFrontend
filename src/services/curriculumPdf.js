const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const lineHeight = 15;

function toUtf16Hex(value) {
    const text = String(value || '');
    const bytes = [0xfe, 0xff];

    for (let i = 0; i < text.length; i += 1) {
        const code = text.charCodeAt(i);
        bytes.push((code >> 8) & 0xff, code & 0xff);
    }

    return `<${bytes.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}>`;
}

function wrapLine(line, maxChars) {
    const words = String(line || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    for (const word of words) {
        if (!current) {
            current = word;
        } else if (`${current} ${word}`.length <= maxChars) {
            current = `${current} ${word}`;
        } else {
            lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    return lines.length ? lines : [''];
}

function buildTextPages(title, content) {
    const pages = [];
    let currentPage = [];
    let y = pageHeight - margin;

    const pushLine = (text, fontSize = 10) => {
        if (y < margin) {
            pages.push(currentPage);
            currentPage = [];
            y = pageHeight - margin;
        }

        currentPage.push({ text, y, fontSize });
        y -= fontSize > 10 ? lineHeight + 6 : lineHeight;
    };

    pushLine(title, 16);
    y -= 8;

    for (const paragraph of String(content || '').split(/\r?\n/)) {
        if (!paragraph.trim()) {
            y -= lineHeight;
            continue;
        }

        for (const line of wrapLine(paragraph, 88)) {
            pushLine(line, 10);
        }
    }

    pages.push(currentPage);
    return pages;
}

export function generateCurriculumPdfBlob({ title, content }) {
    const objects = [];
    const addObject = value => {
        objects.push(value);
        return objects.length;
    };

    const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const pagesId = addObject('');
    const pageIds = [];

    for (const pageLines of buildTextPages(title, content)) {
        const streamLines = ['BT'];
        for (const line of pageLines) {
            streamLines.push(`/F1 ${line.fontSize} Tf`);
            streamLines.push(`1 0 0 1 ${margin} ${line.y} Tm`);
            streamLines.push(`${toUtf16Hex(line.text)} Tj`);
        }
        streamLines.push('ET');

        const stream = streamLines.join('\n');
        const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
        const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        pageIds.push(pageId);
    }

    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const encoder = new TextEncoder();
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
        offsets.push(encoder.encode(pdf).length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
}
