// js/modules/notifications.js
import { supabase, SEND_NOTIFICATION_URL } from '../supabase-client.js';

export const initNotifications = () => {
    const form    = document.getElementById('notificationForm');
    const target  = document.getElementById('notificationTarget');
    const title   = document.getElementById('notificationTitle');
    const message = document.getElementById('notificationMessage');
    const status  = document.getElementById('notificationStatus');
    const specId  = document.getElementById('specificId');
    const specLbl = specId?.previousElementSibling;

    target?.addEventListener('change', () => {
        const show = target.value.includes('specific');
        if (specId)  specId.style.display  = show ? 'block' : 'none';
        if (specLbl) specLbl.style.display = show ? 'block' : 'none';
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (status) status.textContent = 'Відправка...';

        const { data: { session } } = await supabase.auth.getSession();
        try {
            const res = await fetch(SEND_NOTIFICATION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    title:         title.value,
                    body:          message.value,
                    recipientType: target.value,
                    specificId:    specId?.value,
                }),
            });
            if (!res.ok) throw new Error('Помилка сервера');
            if (status) status.textContent = 'Надіслано!';
            form.reset();
        } catch (err) {
            if (status) status.textContent = `Помилка: ${err.message}`;
        }
    });
};