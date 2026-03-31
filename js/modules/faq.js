// js/modules/faq.js
import { supabase } from '../supabase-client.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const _el = (id) => document.getElementById(id);

// ─── Change FAQ display_order (NULL-swap) ─────────────────────────────────────

const changeFaqOrder = async (id, direction) => {
    const { data: cur } = await supabase
        .from('faqs').select('id, display_order').eq('id', id).single();
    if (!cur || cur.display_order == null) return;

    const targetOrder =
        direction === 'up' ? cur.display_order - 1 : cur.display_order + 1;
    if (targetOrder < 1) return;

    const { data: swap } = await supabase
        .from('faqs').select('id, display_order').eq('display_order', targetOrder).single();

    if (swap) {
        await supabase.from('faqs').update({ display_order: null }).eq('id', swap.id);
        await supabase.from('faqs').update({ display_order: targetOrder }).eq('id', id);
        await supabase.from('faqs').update({ display_order: cur.display_order }).eq('id', swap.id);
    } else {
        await supabase.from('faqs').update({ display_order: targetOrder }).eq('id', id);
    }
    await fetchFaqsAdmin();
};

// ─── Fetch & render ───────────────────────────────────────────────────────────

export const fetchFaqsAdmin = async () => {
    const tbody = _el('faqList');
    if (!tbody) return;
    tbody.innerHTML = '';

    const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red;">${error.message}</td></tr>`;
        return;
    }

    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">FAQ відсутні.</td></tr>';
        return;
    }

    data.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center;width:50px;">${f.display_order ?? f.id}</td>
            <td>${f.question_uk}</td>
            <td style="white-space:nowrap;">
                <button class="order-btn faq-up-btn"   data-id="${f.id}" title="Вгору">▲</button>
                <button class="order-btn faq-down-btn" data-id="${f.id}" title="Вниз" style="margin-right:6px;">▼</button>
                <button class="edit-btn"   data-id="${f.id}">✎</button>
                <button class="delete-btn" data-id="${f.id}">🗑</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

// ─── Init form + table events ─────────────────────────────────────────────────

export const initFaq = () => {
    const form        = _el('faqForm');
    const idInput     = _el('faqId');
    const qUk         = _el('faqQuestionUk');
    const aUk         = _el('faqAnswerUk');
    const qEn         = _el('faqQuestionEn');
    const aEn         = _el('faqAnswerEn');
    const clearBtn    = _el('clearFaqForm');
    const tbody       = _el('faqList');

    const clearForm = () => { form?.reset(); if (idInput) idInput.value = ''; };

    clearBtn?.addEventListener('click', clearForm);

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const obj = {
            question_uk: qUk.value, answer_uk: aUk.value,
            question_en: qEn.value, answer_en: aEn.value,
        };
        if (idInput.value) {
            await supabase.from('faqs').update(obj).eq('id', idInput.value);
        } else {
            await supabase.from('faqs').insert([obj]);
        }
        clearForm();
        await fetchFaqsAdmin();
    });

    tbody?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;

        if (btn.classList.contains('faq-up-btn'))   await changeFaqOrder(id, 'up');
        if (btn.classList.contains('faq-down-btn'))  await changeFaqOrder(id, 'down');

        if (btn.classList.contains('delete-btn')) {
            if (!confirm('Видалити FAQ?')) return;
            await supabase.from('faqs').delete().eq('id', id);
            await fetchFaqsAdmin();
        }

        if (btn.classList.contains('edit-btn')) {
            const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
            if (!data) return;
            idInput.value = data.id;
            qUk.value = data.question_uk; aUk.value = data.answer_uk;
            qEn.value = data.question_en; aEn.value = data.answer_en;
            form.scrollIntoView({ behavior: 'smooth' });
        }
    });
};