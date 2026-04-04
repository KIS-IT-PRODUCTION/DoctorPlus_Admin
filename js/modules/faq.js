// js/modules/faq.js
import { supabase } from '../supabase-client.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const _el = (id) => document.getElementById(id);

// ─── Change FAQ display_order (NULL-swap) ─────────────────────────────────────
const changeFaqOrder = async (id, direction) => {
    const { data: cur } = await supabase
        .from('faqs').select('id, display_order').eq('id', id).single();
    
    if (!cur) return;

    // Якщо номер відсутній (null), просто призначаємо найбільший наявний + 1
    if (cur.display_order == null) {
        const { data: maxData } = await supabase
            .from('faqs').select('display_order')
            .order('display_order', { ascending: false }).limit(1);
        const nextOrder = (maxData?.[0]?.display_order || 0) + 1;
        await supabase.from('faqs').update({ display_order: nextOrder }).eq('id', id);
        await fetchFaqsAdmin();
        return;
    }

    const targetOrder = direction === 'up' ? cur.display_order - 1 : cur.display_order + 1;
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
            <td style="text-align:center;width:50px;">${f.display_order ?? '-'}</td>
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
    const orderInput  = _el('faqDisplayOrder'); // Нове поле
    const clearBtn    = _el('clearFaqForm');
    const tbody       = _el('faqList');

    const clearForm = () => { 
        form?.reset(); 
        if (idInput) idInput.value = ''; 
        if (orderInput) orderInput.value = ''; 
    };

    clearBtn?.addEventListener('click', clearForm);

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let orderVal = orderInput?.value ? parseInt(orderInput.value, 10) : null;

        // Якщо це новий запис і номер не вказано вручну — генеруємо автоматично (MAX + 1)
        if (!orderVal && !idInput.value) {
            const { data: maxData } = await supabase
                .from('faqs').select('display_order')
                .order('display_order', { ascending: false }).limit(1);
            orderVal = (maxData?.[0]?.display_order || 0) + 1;
        }

        const obj = {
            question_uk: qUk.value, 
            answer_uk: aUk.value,
            question_en: qEn.value, 
            answer_en: aEn.value,
            display_order: orderVal
        };

        let dbError = null;

        // Збереження або оновлення
        if (idInput.value) {
            const { error } = await supabase.from('faqs').update(obj).eq('id', idInput.value);
            dbError = error;
        } else {
            const { error } = await supabase.from('faqs').insert([obj]);
            dbError = error;
        }

        // Обробка помилок бази даних (особливо конфлікт унікального номера)
        if (dbError) {
            if (dbError.code === '23505') { 
                alert('Помилка: FAQ з таким порядковим номером вже існує! Введіть інший номер або скористайтеся кнопками Вгору/Вниз.');
            } else {
                alert('Помилка: ' + dbError.message);
            }
            return;
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
            qUk.value = data.question_uk; 
            aUk.value = data.answer_uk;
            qEn.value = data.question_en; 
            aEn.value = data.answer_en;
            if (orderInput) orderInput.value = data.display_order || ''; 
            
            form.scrollIntoView({ behavior: 'smooth' });
        }
    });
};