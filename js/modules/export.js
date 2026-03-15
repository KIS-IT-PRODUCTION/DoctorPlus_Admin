// js/modules/export.js
import { supabase } from '../supabase-client.js';

export const initExportLogic = () => {
    const exportCsvBtn = document.getElementById('exportSelectedCsv');
    const exportPdfBtn = document.getElementById('exportSelectedPdf');
    const exportDataTypeSelect = document.getElementById('exportDataType');
    const exportStatus = document.getElementById('exportStatus');

    if (!exportCsvBtn || !exportPdfBtn) return;

    exportCsvBtn.addEventListener('click', () => handleExport('csv', exportDataTypeSelect.value, exportStatus));
    exportPdfBtn.addEventListener('click', () => handleExport('pdf', exportDataTypeSelect.value, exportStatus));
};

const handleExport = async (format, type, statusEl) => {
    if (statusEl) statusEl.textContent = `Експорт ${format.toUpperCase()}... Зачекайте.`;

    let data = [];
    try {
        if (type === 'patients') {
            const { data: res, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            data = res;
        } else if (type === 'doctors') {
            const { data: res, error } = await supabase.from('anketa_doctor').select('*');
            if (error) throw error;
            data = res;
        } else if (type === 'all_users') {
            // Збираємо і пацієнтів, і лікарів
            const { data: pRes } = await supabase.from('profiles').select('user_id, email, full_name, created_at');
            const { data: dRes } = await supabase.from('anketa_doctor').select('user_id, email, full_name, created_at');
            
            const formattedPatients = (pRes || []).map(p => ({ ...p, role: 'Patient' }));
            const formattedDoctors = (dRes || []).map(d => ({ ...d, role: 'Doctor' }));
            data = [...formattedPatients, ...formattedDoctors];
        }

        if (!data || data.length === 0) {
            if (statusEl) statusEl.textContent = 'Немає даних для експорту.';
            return;
        }

        if (format === 'csv') {
            generateCSV(data, type);
            if (statusEl) statusEl.textContent = 'CSV файл успішно завантажено!';
        } else if (format === 'pdf') {
            generatePDF(data, type);
            if (statusEl) statusEl.textContent = 'PDF файл успішно завантажено!';
        }
    } catch (error) {
        console.error("Помилка експорту:", error);
        if (statusEl) statusEl.textContent = `Помилка: ${error.message}`;
    }
};

const generateCSV = (data, type) => {
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = '\uFEFF' + [header, ...rows].join('\n'); // \uFEFF для коректного відображення кирилиці в Excel

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${type}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const generatePDF = (data, type) => {
    if (!window.jspdf) {
        alert('Бібліотека PDF не знайдена. Перевірте підключення jsPDF у HTML.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l'); // Альбомна орієнтація

    // Для PDF беремо лише перші 6 колонок, щоб таблиця не вилізла за краї
    const maxCols = 6;
    const keys = Object.keys(data[0]).slice(0, maxCols);
    const body = data.map(row => keys.map(k => String(row[k] || '').substring(0, 40)));

    doc.text(`Експорт даних: ${type} (${new Date().toLocaleDateString()})`, 14, 15);
    doc.autoTable({
        head: [keys],
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 123, 255] }
    });
    doc.save(`export_${type}_${new Date().toISOString().slice(0,10)}.pdf`);
};