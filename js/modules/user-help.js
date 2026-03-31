// js/modules/user-help.js
import { supabase } from '../supabase-client.js';

let _currentHelpRequestId = null;

export const fetchUserHelp = async () => {
    const tbody = document.getElementById('userHelpList');
    if (!tbody) return;
    tbody.innerHTML = '';

    const { data } = await supabase
        .from('user_help').select('*').order('created_at', { ascending: false });

    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Звернень немає.</td></tr>';
        return;
    }

    data.forEach(h => {
        const tr = document.createElement('tr');
        if (h.is_resolved) tr.classList.add('resolved-row');
        tr.innerHTML = `
            <td>${new Date(h.created_at).toLocaleDateString('uk-UA')}</td>
            <td>${h.email}</td>
            <td>${h.type || 'Питання'}</td>
            <td>${String(h.message).substring(0, 30)}…</td>
            <td>${h.is_resolved ? '✔ Вирішено' : '⏳ В процесі'}</td>
            <td>
                <button class="reply-btn"
                    data-id="${h.id}"
                    data-email="${h.email}"
                    data-msg="${encodeURIComponent(h.message)}"
                    data-res="${h.is_resolved}">Деталі</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

export const initUserHelp = () => {
    document.getElementById('userHelpList')?.addEventListener('click', e => {
        const btn = e.target.closest('.reply-btn');
        if (!btn) return;
        _currentHelpRequestId = btn.dataset.id;

        const emailEl   = document.getElementById('replyUserEmailDisplay');
        const msgEl     = document.getElementById('originalUserMessageDisplay');
        const statusEl  = document.getElementById('currentReplyStatus');
        const toggleTxt = document.getElementById('toggleResolvedText');
        const toggleBtn = document.getElementById('toggleResolvedButton');
        const modal     = document.getElementById('replyModal');

        if (emailEl)  emailEl.value  = btn.dataset.email;
        if (msgEl)    msgEl.value    = decodeURIComponent(btn.dataset.msg);
        const isRes = btn.dataset.res === 'true';
        if (statusEl)  statusEl.textContent  = isRes ? 'Вирішено' : 'В процесі';
        if (toggleTxt) toggleTxt.textContent = isRes
            ? 'Позначити як Невирішене' : 'Позначити як Вирішене';
        if (toggleBtn) {
            isRes
                ? toggleBtn.classList.add('resolved')
                : toggleBtn.classList.remove('resolved');
        }
        if (modal) modal.style.display = 'block';
    });

    document.getElementById('toggleResolvedButton')?.addEventListener('click', async () => {
        const statusEl = document.getElementById('currentReplyStatus');
        const isResolved = statusEl?.textContent === 'Вирішено';
        await supabase
            .from('user_help')
            .update({ is_resolved: !isResolved })
            .eq('id', _currentHelpRequestId);
        const modal = document.getElementById('replyModal');
        if (modal) modal.style.display = 'none';
        fetchUserHelp();
    });
};