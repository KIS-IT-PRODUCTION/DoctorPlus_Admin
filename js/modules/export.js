// js/modules/export.js
import { supabase } from '../supabase-client.js';
import { formatUSD } from './utils.js';

const getUserExportData = async (type) => {
    let patients = [], doctors = [];

    if (type === 'all_users' || type === 'patients') {
        const { data } = await supabase
            .from('profiles').select('full_name, email, created_at');
        patients = (data || []).map(r => ({ ...r, role: 'Пацієнт' }));
    }
    if (type === 'all_users' || type === 'doctors') {
        const { data } = await supabase
            .from('anketa_doctor').select('full_name, email, created_at');
        doctors = (data || []).map(r => ({ ...r, role: 'Лікар' }));
    }
    return [...patients, ...doctors];
};

export const initExport = () => {
    const typeSelect  = document.getElementById('exportDataType');
    const csvBtn      = document.getElementById('exportSelectedCsv');
    const pdfBtn      = document.getElementById('exportSelectedPdf');
    const statusEl    = document.getElementById('exportStatus');

    csvBtn?.addEventListener('click', async () => {
        if (statusEl) statusEl.textContent = 'Формування CSV...';
        const rows = await getUserExportData(typeSelect?.value || 'all_users');
        if (!rows.length) { if (statusEl) statusEl.textContent = 'Немає даних.'; return; }

        const header = "Повне ім'я,Email,Роль,Дата реєстрації";
        const csv = [header, ...rows.map(r =>
            `"${r.full_name || ''}","${r.email || ''}","${r.role}","${new Date(r.created_at).toLocaleDateString('uk-UA')}"`
        )].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `users-export-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        if (statusEl) statusEl.textContent = 'CSV завантажено!';
    });

    pdfBtn?.addEventListener('click', async () => {
        if (statusEl) statusEl.textContent = 'Формування PDF...';
        pdfBtn.disabled = true;
        try {
            const rows = await getUserExportData(typeSelect?.value || 'all_users');
            if (!rows.length) { if (statusEl) statusEl.textContent = 'Немає даних.'; return; }

            const printDiv = document.createElement('div');
            printDiv.style.cssText =
                'position:fixed;top:-9999px;left:-9999px;width:900px;background:#fff;padding:30px;font-family:Arial,sans-serif;font-size:13px;color:#000;';
            printDiv.innerHTML = `
                <h2 style="margin:0 0 6px;font-size:17px;color:#2c3e50;">Експорт Користувачів</h2>
                <p style="margin:0 0 14px;color:#666;font-size:11px;">
                    Дата: ${new Date().toLocaleDateString('uk-UA')}
                </p>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>${["Повне ім'я","Email","Роль","Дата реєстрації"].map(h =>
                            `<th style="background:#2980b9;color:#fff;padding:9px 7px;text-align:left;font-size:11px;border:1px solid #1a5276;">${h}</th>`
                        ).join('')}</tr>
                    </thead>
                    <tbody>
                        ${rows.map((r, i) => `
                            <tr style="background:${i % 2 === 0 ? '#fff' : '#eef5fc'};">
                                <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${r.full_name || '—'}</td>
                                <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${r.email || '—'}</td>
                                <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${r.role}</td>
                                <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${new Date(r.created_at).toLocaleDateString('uk-UA')}</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>`;

            document.body.appendChild(printDiv);
            const canvas = await html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff' });
            document.body.removeChild(printDiv);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgW = pdf.internal.pageSize.getWidth() - 20;
            const imgH = (canvas.height * imgW) / canvas.width;
            pdf.addImage(
                canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW,
                Math.min(imgH, pdf.internal.pageSize.getHeight() - 20)
            );
            pdf.save(`users-export-${new Date().toISOString().slice(0,10)}.pdf`);
            if (statusEl) statusEl.textContent = 'PDF завантажено!';
        } catch (err) {
            console.error('Users PDF export:', err);
            if (statusEl) statusEl.textContent = `Помилка: ${err.message}`;
        } finally {
            pdfBtn.disabled = false;
        }
    });
};