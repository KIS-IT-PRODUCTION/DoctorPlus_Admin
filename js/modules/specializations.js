// js/modules/specializations.js
import { supabase } from '../supabase-client.js';
import { parseJsonbArray } from './utils.js';

// ─── PUBLIC: Build checkboxes for the doctor details modal ────────────────────

export const buildSpecializationCheckboxes = async (currentSpecs = []) => {
    // ВАЖЛИВО: Використовуємо правильний ID з вашого HTML
    const container = document.getElementById('specializationCheckboxList');
    
    if (!container) {
        console.error("Не знайдено контейнер 'specializationCheckboxList' у HTML!");
        return;
    }

    container.innerHTML = '<span style="color:#aaa;font-size:.9em;">Завантаження...</span>';

    // Завантажуємо актуальні спеціалізації прямо з БД
    const { data: dbSpecs, error } = await supabase
        .from('specializations')
        .select('name_uk')
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });

    if (error) {
        container.innerHTML = '<span style="color:red">Помилка завантаження спеціалізацій</span>';
        console.error('Помилка:', error.message);
        return;
    }

    container.innerHTML = ''; // Очищаємо контейнер перед рендером

    if (!dbSpecs || dbSpecs.length === 0) {
        container.innerHTML = '<span style="color:#aaa;font-size:.9em;">Немає активних спеціалізацій</span>';
        return;
    }

    // Малюємо чекбокси
    dbSpecs.forEach(spec => {
        const specName = spec.name_uk;
        
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '6px';
        label.style.cursor = 'pointer';
        label.style.fontSize = '0.95em';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = specName;
        
        // Якщо ця спеціалізація є в масиві лікаря, ставимо галочку
        if (currentSpecs.includes(specName)) {
            checkbox.checked = true;
        }

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(specName));

        container.appendChild(label);
    });
};

// ─── PUBLIC: Get selected checkboxes for saving ───────────────────────────────

export const getSelectedSpecializations = () => {
    // ВАЖЛИВО: Використовуємо правильний ID з вашого HTML
    const container = document.getElementById('specializationCheckboxList');
    if (!container) return [];

    // Збираємо всі значення з відмічених чекбоксів
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkedBoxes).map(cb => cb.value);
};

// ─── PUBLIC: update the doctor-list specialization filter dropdown ─────────────
export const updateSpecializationFilter = async (specs, current) => {
    const sel = document.getElementById('specializationFilter');
    if (!sel) return;
    
    console.log("⏳ Запит до таблиці specializations...");

    // Тимчасово прибираємо .eq('is_active', true) і робимо select('*'), 
    // щоб побачити, чи взагалі віддає база хоч якісь дані
    const { data: dbSpecs, error } = await supabase
        .from('specializations')
        .select('*') 
        .order('display_order', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('❌ Помилка Supabase (спеціалізації):', error.message, error.details);
        return;
    }

    console.log("✅ Отримані дані з бази:", dbSpecs);

    sel.innerHTML = '<option value="">Всі спеціалізації</option>';
    
    if (!dbSpecs || dbSpecs.length === 0) {
        console.warn("⚠️ Увага: БД повернула порожній масив спеціалізацій!");
        return;
    }

    dbSpecs.forEach(spec => {
        // Якщо у вас немає колонки is_active, або вона false, ми все одно їх виведемо для тесту.
        // Перевіряємо, як реально називається колонка з назвою (name_uk чи просто name)
        const specName = spec.name_uk || spec.name || 'Без назви'; 
        
        const opt = document.createElement('option');
        opt.value = specName; 
        opt.textContent = specName + (spec.is_active ? '' : ' (неактивна)');
        
        if (current === specName || current === spec.slug) {
            opt.selected = true;
        }
        
        sel.appendChild(opt);
    });
};

// ─── PRIVATE: change display_order ────────────────────────────────────────────

const changeSpecOrder = async (id, direction) => {
    const { data: cur } = await supabase
        .from('specializations')
        .select('id, display_order')
        .eq('id', id)
        .single();
    if (!cur || cur.display_order == null) return;

    const targetOrder =
        direction === 'up' ? cur.display_order - 1 : cur.display_order + 1;
    if (targetOrder < 1) return;

    const { data: swap } = await supabase
        .from('specializations')
        .select('id, display_order')
        .eq('display_order', targetOrder)
        .single();

    if (swap) {
        // NULL as safe temp to avoid unique-constraint collision
        await supabase.from('specializations').update({ display_order: null }).eq('id', swap.id);
        await supabase.from('specializations').update({ display_order: targetOrder }).eq('id', id);
        await supabase.from('specializations').update({ display_order: cur.display_order }).eq('id', swap.id);
    } else {
        await supabase.from('specializations').update({ display_order: targetOrder }).eq('id', id);
    }

    await fetchSpecializations();
};

// ─── PUBLIC: fetch & render specializations table ─────────────────────────────

export const fetchSpecializations = async () => {
    const tbody = document.getElementById('specializationsList');
    if (!tbody) return;
    tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">Завантаження...</td></tr>';

    const { data: specs, error } = await supabase
        .from('specializations')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">Помилка: ${error.message}</td></tr>`;
        return;
    }

    // Count approved doctors per specialization (robust JSONB parse)
    const { data: doctorsRaw } = await supabase
        .from('anketa_doctor')
        .select('specialization')
        .eq('doctor_check', true);

    const doctorCount = {};
    (doctorsRaw || []).forEach(d => {
        const arr = parseJsonbArray(d.specialization);
        arr.forEach(s => {
            const key = String(s).trim();
            doctorCount[key] = (doctorCount[key] || 0) + 1;
        });
    });

    if (!specs?.length) {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">Спеціальностей немає. Додайте першу!</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    specs.forEach(spec => {
        const count = doctorCount[spec.name_uk] || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center;">${spec.display_order ?? '—'}</td>
            <td style="font-size:1.3em;text-align:center;">${spec.icon || '—'}</td>
            <td><strong>${spec.name_uk}</strong></td>
            <td>${spec.name_en}</td>
            <td style="text-align:center;">
                <strong style="color:${count > 0 ? '#007bff' : '#999'}">${count}</strong>
            </td>
            <td style="text-align:center;">
                <span style="display:inline-block;padding:3px 8px;border-radius:10px;font-size:.8em;font-weight:bold;
                    background:${spec.is_active ? '#d4edda' : '#f8d7da'};
                    color:${spec.is_active ? '#155724' : '#721c24'};">
                    ${spec.is_active ? '✔ Активна' : '✖ Прихована'}
                </span>
            </td>
            <td>
                <button class="order-btn spec-up-btn"  data-id="${spec.id}" title="Вгору"  style="margin-right:2px;">▲</button>
                <button class="order-btn spec-down-btn" data-id="${spec.id}" title="Вниз"  style="margin-right:4px;">▼</button>
                <button class="edit-btn spec-edit-btn"   data-id="${spec.id}" title="Редагувати" style="margin-right:4px;">✎</button>
                <button class="toggle-active-btn spec-toggle-btn"
                    data-id="${spec.id}" data-active="${spec.is_active}"
                    style="background:${spec.is_active ? '#ffc107' : '#28a745'};color:${spec.is_active ? '#333' : '#fff'};
                           border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-right:4px;"
                    title="${spec.is_active ? 'Приховати' : 'Активувати'}">
                    ${spec.is_active ? '🙈' : '👁'}
                </button>
                <button class="delete-btn spec-delete-btn" data-id="${spec.id}" data-count="${count}" title="Видалити">🗑</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

// ─── PUBLIC: init form + table events ─────────────────────────────────────────

export const initSpecializations = () => {
    const form               = document.getElementById('specializationForm');
    const formTitle          = document.getElementById('specializationFormTitle');
    const idInput            = document.getElementById('specializationId');
    const nameUkInput        = document.getElementById('specializationNameUk');
    const nameEnInput        = document.getElementById('specializationNameEn');
    const iconInput          = document.getElementById('specializationIcon');
    const clearBtn           = document.getElementById('clearSpecializationForm');
    const statusEl           = document.getElementById('specializationStatus');
    const tbody              = document.getElementById('specializationsList');

    const clearForm = () => {
        form?.reset();
        if (idInput)    idInput.value = '';
        if (formTitle)  formTitle.textContent = 'Додати нову спеціальність';
        if (statusEl)   statusEl.textContent = '';
    };

    clearBtn?.addEventListener('click', clearForm);

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusEl.textContent = 'Збереження...';
        statusEl.style.color = '#333';

// Функція для створення безпечного slug з англійської назви
        const generateSlug = (text) => {
            return text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_') // Замінюємо пробіли та спецсимволи на _
                .replace(/^_|_$/g, '');      // Прибираємо _ на початку та в кінці
        };

        const nameEnClean = nameEnInput.value.trim();

        const payload = {
            name_uk: nameUkInput.value.trim(),
            name_en: nameEnClean,
            icon:    iconInput.value.trim() || null,
            slug:    generateSlug(nameEnClean) // Додаємо автозгенерований slug
        };
        const editId = idInput.value;
        let dbError;

        if (editId) {
            ({ error: dbError } = await supabase
                .from('specializations').update(payload).eq('id', editId));
        } else {
            ({ error: dbError } = await supabase
                .from('specializations').insert([{ ...payload, is_active: true }]));
        }

        if (dbError) {
            statusEl.textContent = dbError.message.includes('unique')
                ? 'Спеціальність з такою назвою вже існує.'
                : `Помилка: ${dbError.message}`;
            statusEl.style.color = 'red';
        } else {
            statusEl.textContent = editId ? 'Оновлено!' : 'Спеціальність додано!';
            statusEl.style.color = 'green';
            clearForm();
            await fetchSpecializations();
        }
    });

    tbody?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;

        if (btn.classList.contains('spec-up-btn'))   await changeSpecOrder(id, 'up');
        if (btn.classList.contains('spec-down-btn'))  await changeSpecOrder(id, 'down');

        if (btn.classList.contains('spec-edit-btn')) {
            const { data } = await supabase.from('specializations').select('*').eq('id', id).single();
            if (!data) return;
            idInput.value    = data.id;
            nameUkInput.value = data.name_uk;
            nameEnInput.value = data.name_en;
            iconInput.value  = data.icon || '';
            formTitle.textContent = `Редагування: ${data.name_uk}`;
            statusEl.textContent  = '';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (btn.classList.contains('spec-toggle-btn')) {
            const isActive = btn.dataset.active === 'true';
            const { error } = await supabase
                .from('specializations').update({ is_active: !isActive }).eq('id', id);
            if (error) alert(`Помилка: ${error.message}`);
            else await fetchSpecializations();
        }

        if (btn.classList.contains('spec-delete-btn')) {
            const count = parseInt(btn.dataset.count) || 0;
            const warn  = count > 0
                ? `⚠️ ${count} лікар${count === 1 ? '' : 'ів'} мають цю спеціальність.\n\n`
                : '';
            if (!confirm(`${warn}Видалити спеціальність? Цю дію неможливо скасувати.`)) return;
            const { error } = await supabase.from('specializations').delete().eq('id', id);
            if (error) alert(`Помилка: ${error.message}`);
            else await fetchSpecializations();
        }
    });
};