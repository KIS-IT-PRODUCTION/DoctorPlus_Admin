// js/modules/consultations.js
import { supabase } from '../supabase-client.js';
import { formatUSD, formatDate, formatTime } from './utils.js';

// ─── Global consultations table ───────────────────────────────────────────────

export const fetchAllConsultations = async (dateFrom = null, dateTo = null) => {
    const tbody = document.getElementById('allConsultationsList');
    if (!tbody) return;
    tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Завантаження...</td></tr>';

    let query = supabase
        .from('patient_bookings')
        .select(`
            booking_date, booking_time_slot, amount, status, is_paid,
            profiles:patient_id   (full_name, email),
            anketa_doctor:doctor_id (full_name)
        `)
        .order('booking_date', { ascending: false });

    if (dateFrom) query = query.gte('booking_date', dateFrom);
    if (dateTo)   query = query.lte('booking_date', dateTo);

    const { data, error } = await query;

    if (error) {
        tbody.innerHTML =
            `<tr><td colspan="5" style="text-align:center;color:red;">Помилка: ${error.message}</td></tr>`;
        return;
    }
    if (!data?.length) {
        tbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;">Консультацій не знайдено.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach(row => {
        const doctorName  = row.anketa_doctor?.full_name || '—';
        const patientName = row.profiles?.full_name      || 'Гість';
        const paidMark    = row.is_paid
            ? '<span style="color:green">✔</span>'
            : '<span style="color:red">✖</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(row.booking_date)} ${formatTime(row.booking_time_slot)}</td>
            <td>${doctorName}</td>
            <td>${patientName}</td>
            <td><span class="status-badge status-${row.status || 'pending'}">${row.status || '—'}</span></td>
            <td>${formatUSD(row.amount)} ${paidMark}</td>`;
        tbody.appendChild(tr);
    });
};

// ─── Table data extractor for export ─────────────────────────────────────────

export const getTableData = (tableId) => {
    const table = document.getElementById(tableId);
    if (!table) return { headers: [], rows: [] };
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
    const rows    = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
    );
    return { headers, rows };
};

// ─── PDF export (html2canvas → jsPDF) ────────────────────────────────────────

export const renderTableToPdf = async (tableId, title, orientation = 'landscape') => {
    const { headers, rows } = getTableData(tableId);
    if (!rows.length) {
        alert('Немає даних для експорту. Спочатку завантажте дані.');
        return null;
    }

    const width   = orientation === 'landscape' ? 1200 : 900;
    const printDiv = document.createElement('div');
    printDiv.style.cssText = `
        position:fixed;top:-9999px;left:-9999px;width:${width}px;
        background:#fff;padding:30px;font-family:Arial,sans-serif;font-size:13px;color:#000;`;

    printDiv.innerHTML = `
        <h2 style="margin:0 0 6px;font-size:17px;color:#2c3e50;">${title}</h2>
        <p style="margin:0 0 14px;color:#666;font-size:11px;">
            Дата формування: ${new Date().toLocaleDateString('uk-UA')}
        </p>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr>${headers.map(h =>
                    `<th style="background:#2980b9;color:#fff;padding:9px 7px;text-align:left;
                                font-size:11px;border:1px solid #1a5276;">${h}</th>`
                ).join('')}</tr>
            </thead>
            <tbody>
                ${rows.map((row, i) =>
                    `<tr style="background:${i % 2 === 0 ? '#fff' : '#eef5fc'};">
                        ${row.map(cell =>
                            `<td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${cell}</td>`
                        ).join('')}
                    </tr>`
                ).join('')}
            </tbody>
        </table>`;

    document.body.appendChild(printDiv);
    const canvas = await html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    document.body.removeChild(printDiv);

    const { jsPDF }  = window.jspdf;
    const pdf        = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageW      = pdf.internal.pageSize.getWidth();
    const pageH      = pdf.internal.pageSize.getHeight();
    const imgW       = pageW - 20;
    const imgH       = (canvas.height * imgW) / canvas.width;
    let yPos = 10, remaining = imgH;

    while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - 20);
        const srcY   = (imgH - remaining) * (canvas.height / imgH);
        const srcH   = sliceH * (canvas.height / imgH);
        const sc     = document.createElement('canvas');
        sc.width  = canvas.width;
        sc.height = srcH;
        sc.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        pdf.addImage(sc.toDataURL('image/png'), 'PNG', 10, yPos, imgW, sliceH);
        remaining -= sliceH;
        if (remaining > 0) { pdf.addPage(); yPos = 10; }
    }
    return pdf;
};

// ─── DOC export ───────────────────────────────────────────────────────────────

export const exportTableAsDoc = (tableId, title, filename) => {
    const { headers, rows } = getTableData(tableId);
    if (!rows.length) { alert('Немає даних для експорту.'); return; }

    const tableHtml = `
        <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`;

    const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>${title}</title>
            <style>
                body  { font-family:Arial,sans-serif;font-size:11pt; }
                h2    { color:#2c3e50;font-size:15pt; }
                p     { color:#666;font-size:10pt;margin-bottom:10pt; }
                table { border-collapse:collapse;width:100%; }
                th    { background:#2980b9;color:white;padding:8pt;text-align:left;
                        border:1pt solid #1a5276;font-size:10pt; }
                td    { padding:7pt;border:1pt solid #dee2e6;font-size:10pt; }
                tr:nth-child(even) td { background:#eef5fc; }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            <p>Дата формування: ${new Date().toLocaleDateString('uk-UA')}</p>
            ${tableHtml}
        </body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ─── Wire up filter + export buttons ─────────────────────────────────────────

export const initConsultations = () => {
    document.getElementById('filterGlobalConsultationsBtn')
        ?.addEventListener('click', () => {
            fetchAllConsultations(
                document.getElementById('globalConsultationDateFrom')?.value || null,
                document.getElementById('globalConsultationDateTo')?.value   || null
            );
        });

    const pdfBtn = document.getElementById('exportConsultationsPdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', async () => {
            pdfBtn.disabled = true;
            pdfBtn.innerHTML = '⏳ Формування...';
            try {
                const pdf = await renderTableToPdf(
                    'allConsultationsTable', 'Звіт: Усі консультації лікарів', 'landscape'
                );
                if (pdf) pdf.save(`consultations-${new Date().toISOString().slice(0,10)}.pdf`);
            } catch (err) {
                console.error('PDF export:', err);
                alert(`Помилка: ${err.message}`);
            } finally {
                pdfBtn.disabled = false;
                pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
            }
        });
    }

    document.getElementById('exportConsultationsDoc')
        ?.addEventListener('click', () => {
            exportTableAsDoc(
                'allConsultationsTable',
                'Звіт: Усі консультації лікарів',
                `consultations-${new Date().toISOString().slice(0,10)}.doc`
            );
        });
};