// js/modules/patients.js
import { supabase } from '../supabase-client.js';
import { formatUSD } from './utils.js';

export const fetchPatients = async () => {
    const list = document.getElementById('patientsList');
    if (!list) return;
    list.innerHTML = '<li>Завантаження...</li>';

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) { list.innerHTML = `<li>Помилка: ${error.message}</li>`; return; }

    const { data: bookings } = await supabase
        .from('patient_bookings')
        .select('patient_id, amount, is_paid')
        .eq('is_paid', true);

    list.innerHTML = profiles.length ? '' : '<li>Пацієнтів немає.</li>';

    profiles.forEach(p => {
        const pBookings = bookings
            ? bookings.filter(b => b.patient_id === p.user_id)
            : [];
        const totalSpent = pBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display:flex;justify-content:space-between;width:100%;">
                <div>
                    <strong>${p.full_name || 'Гість'}</strong><br>
                    <small>${p.email || ''}</small>
                </div>
                <div style="text-align:right;">
                    Витрачено: <strong>${formatUSD(totalSpent)}</strong>
                </div>
            </div>`;
        list.appendChild(li);
    });
};