// js/modules/doctors.js
import { supabase } from '../supabase-client.js';
import {
    formatArr, parseArray, parseJsonbArray, formatUSD, formatDate, formatTime
} from './utils.js';
import {
    buildSpecializationCheckboxes,
    getSelectedSpecializations,
    updateSpecializationFilter
} from './specializations.js';

export let currentDoctorId = null;

// ─── Doctor list ──────────────────────────────────────────────────────────────

// ─── Doctor list ──────────────────────────────────────────────────────────────

export const fetchDoctors = async (specFilter = null) => {
    const list = document.getElementById('doctorsList');
    if (!list) return;
    list.innerHTML = '<li>Завантаження...</li>';

    const { data, error } = await supabase
        .from('anketa_doctor')
        .select('*, display_order')
        .order('display_order', { ascending: true, nullsFirst: false });

    if (error) { list.innerHTML = '<li>Помилка завантаження.</li>'; return; }

    // Викликаємо оновлену функцію, яка сама завантажить активні спеціалізації з БД.
    // Передаємо порожній масив [] замість allSpecs, бо нова функція ігнорує перший аргумент.
    await updateSpecializationFilter([], specFilter);

    // Фільтруємо лікарів за обраною спеціалізацією
    const filteredData = specFilter
        ? data.filter(d => parseJsonbArray(d.specialization)
            .map(s => String(s).trim())
            .includes(specFilter))
        : data;

    list.innerHTML = filteredData.length ? '' : '<li>Лікарів не знайдено.</li>';

    filteredData.forEach(doc => {
        const li = document.createElement('li');
        li.classList.add('doctor-item');
        li.innerHTML = `
            <div class="doctor-info" style="flex-grow:1;cursor:pointer;">
                <span class="order-badge">#${doc.display_order ?? '—'}</span>
                <strong>${doc.full_name}</strong>
                <small>(${doc.email})</small>
                <span style="float:right;color:${doc.doctor_check ? 'green' : 'red'}">
                    ${doc.doctor_check ? '✔' : '⏳'}
                </span>
            </div>
            <div class="order-controls">
                <button class="order-btn up-btn"   data-id="${doc.user_id}">▲</button>
                <button class="order-btn down-btn"  data-id="${doc.user_id}">▼</button>
            </div>`;
        li.querySelector('.doctor-info')
            .addEventListener('click', () => showDoctorDetails(doc.user_id));
        list.appendChild(li);
    });
};

// ─── Change doctor display order (NULL-swap to avoid unique-constraint clash) ──

export const changeDoctorOrder = async (userId, direction) => {
    const { data: cur } = await supabase
        .from('anketa_doctor')
        .select('user_id, display_order')
        .eq('user_id', userId)
        .single();

    if (!cur || cur.display_order == null) return;

    const targetOrder =
        direction === 'up' ? cur.display_order - 1 : cur.display_order + 1;
    if (targetOrder < 1) return;

    const { data: swap } = await supabase
        .from('anketa_doctor')
        .select('user_id, display_order')
        .eq('display_order', targetOrder)
        .single();

    if (swap) {
        // Step 1: free the target slot by setting swap to NULL
        const { error: e1 } = await supabase
            .from('anketa_doctor')
            .update({ display_order: null })
            .eq('user_id', swap.user_id);
        if (e1) { console.error('swap step 1:', e1.message); return; }

        // Step 2: move current doctor to target
        const { error: e2 } = await supabase
            .from('anketa_doctor')
            .update({ display_order: targetOrder })
            .eq('user_id', userId);
        if (e2) { console.error('swap step 2:', e2.message); return; }

        // Step 3: give swap doctor the old order
        const { error: e3 } = await supabase
            .from('anketa_doctor')
            .update({ display_order: cur.display_order })
            .eq('user_id', swap.user_id);
        if (e3) { console.error('swap step 3:', e3.message); return; }
    } else {
        await supabase
            .from('anketa_doctor')
            .update({ display_order: targetOrder })
            .eq('user_id', userId);
    }

    const specFilter = document.getElementById('specializationFilter')?.value || null;
    await fetchDoctors(specFilter);
};

// ─── Doctor modal ─────────────────────────────────────────────────────────────

export const showDoctorDetails = async (userId) => {
    currentDoctorId = userId;
    const modal = document.getElementById('doctorDetailsModal');

    // Reset modal state
    _el('doctorProfileStatus').textContent = '';
    _el('rejectionReasonGroup').style.display = 'none';
    _el('saveDoctorProfileButton').style.display = 'inline-block';
    _el('approveDoctorButton').style.display  = 'none';
    _el('rejectDoctorButton').style.display   = 'none';
    const dateFrom = _el('consultationDateFrom');
    const dateTo   = _el('consultationDateTo');
    if (dateFrom) dateFrom.value = '';
    if (dateTo)   dateTo.value   = '';

    const { data, error } = await supabase
        .from('anketa_doctor').select('*').eq('user_id', userId).single();
    if (error) { alert('Помилка завантаження.'); return; }

    _el('doctorAvatar').src               = data.avatar_url || 'placeholder.jpg';
    _el('inputFullName').value            = data.full_name  || '';
    _el('inputEmail').value               = data.email      || '';
    _el('inputPhone').value               = data.phone      || '';
    _el('inputCountry').value             = data.country    || '';
    _el('inputLanguages').value           = formatArr(data.communication_languages);
    _el('inputExperience').value          = data.experience_years || '';
    _el('inputEducation').value           = data.education  || '';
    _el('inputAchievements').value        = data.achievements || '';
    _el('inputAboutMe').value             = data.about_me   || '';
    _el('inputConsultationCost').value    = data.consultation_cost || '';
    _el('inputConsultationCostRange').value = data.consultation_cost_range || '';
    _el('inputSearchTags').value          = formatArr(data.search_tags);
    _el('inputBankDetails').value         = data.bank_details || '';
    _el('inputDisplayOrder').value        = data.display_order || '';
    _el('detailCertificate').href         = data.certificate_photo_url || '#';
    _el('detailDiploma').href             = data.diploma_url || '#';
    _el('displayDoctorCheck').textContent = data.doctor_check ? 'Так' : 'Ні';

    const currentSpecs = parseJsonbArray(data.specialization);
    await buildSpecializationCheckboxes(currentSpecs);

    if (!data.doctor_check) {
        _el('approveDoctorButton').style.display = 'inline-block';
        _el('rejectDoctorButton').style.display  = 'inline-block';
    }

    await fetchDoctorConsultations(userId);
    modal.style.display = 'block';
};

// ─── Doctor consultations in modal ────────────────────────────────────────────

export const fetchDoctorConsultations = async (doctorId, dateFrom = null, dateTo = null) => {
    const tbody = document.getElementById('doctorConsultationsList');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Завантаження...</td></tr>';

    let query = supabase
        .from('patient_bookings')
        .select(`
            booking_date, booking_time_slot, amount, status, is_paid,
            profiles:patient_id (full_name)
        `)
        .eq('doctor_id', doctorId)
        .order('booking_date', { ascending: false });

    if (dateFrom) query = query.gte('booking_date', dateFrom);
    if (dateTo)   query = query.lte('booking_date', dateTo);

    const { data, error } = await query;

    if (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Помилка: ${error.message}</td></tr>`;
        return;
    }
    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Консультацій не знайдено.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach(row => {
        const patientName = row.profiles?.full_name || 'Гість';
        const paidIcon    = row.is_paid
            ? '<span style="color:green">✔</span>'
            : '<span style="color:red">✖</span>';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(row.booking_date)} ${formatTime(row.booking_time_slot)}</td>
            <td>${patientName}</td>
            <td><span class="status-badge status-${row.status || 'pending'}">${row.status || '—'}</span></td>
            <td>${formatUSD(row.amount)} ${paidIcon}</td>`;
        tbody.appendChild(tr);
    });
};

// ─── Modal action buttons ─────────────────────────────────────────────────────

export const initDoctorModal = () => {
    // Save profile
    _el('saveDoctorProfileButton')?.addEventListener('click', async () => {
        const statusEl = _el('doctorProfileStatus');
        statusEl.textContent = 'Збереження...';
        const updateData = {
            full_name:      _el('inputFullName').value,
            phone:          _el('inputPhone').value,
            country:        _el('inputCountry').value,
            communication_languages: parseArray(_el('inputLanguages').value),
            specialization:          getSelectedSpecializations(),
            search_tags:             parseArray(_el('inputSearchTags').value),
            experience_years:        parseInt(_el('inputExperience').value)         || 0,
            education:               _el('inputEducation').value,
            achievements:            _el('inputAchievements').value,
            about_me:                _el('inputAboutMe').value,
            consultation_cost:       parseFloat(_el('inputConsultationCost').value) || 0,
            consultation_cost_range: _el('inputConsultationCostRange').value,
            bank_details:            _el('inputBankDetails').value,
            display_order:           parseInt(_el('inputDisplayOrder').value) || null,
        };
        const { error } = await supabase
            .from('anketa_doctor').update(updateData).eq('user_id', currentDoctorId);
        if (error) {
            statusEl.textContent = `Помилка: ${error.message}`;
            statusEl.style.color = 'red';
        } else {
            statusEl.textContent = 'Успішно збережено!';
            statusEl.style.color = 'green';
            const specFilter = document.getElementById('specializationFilter')?.value || null;
            fetchDoctors(specFilter);
        }
    });

    // Approve
    _el('approveDoctorButton')?.addEventListener('click', async () => {
        if (!confirm('Схвалити лікаря?')) return;
        const { error } = await supabase
            .from('anketa_doctor').update({ doctor_check: true }).eq('user_id', currentDoctorId);
        if (!error) {
            alert('Лікаря схвалено!');
            _closeModal();
            fetchDoctors();
            _updateNewAppsCount();
        } else { alert(`Помилка: ${error.message}`); }
    });

    // Show reject reason
    _el('rejectDoctorButton')?.addEventListener('click', () => {
        _el('rejectionReasonGroup').style.display = 'block';
    });

    // Send rejection
    _el('sendRejectionButton')?.addEventListener('click', async () => {
        const reason = _el('rejectionReason').value.trim();
        if (!reason) { alert('Вкажіть причину відмови.'); return; }
        const { error } = await supabase
            .from('anketa_doctor').delete().eq('user_id', currentDoctorId);
        if (!error) {
            alert('Лікаря відхилено.');
            _closeModal();
            _updateNewAppsCount();
        } else { alert(`Помилка: ${error.message}`); }
    });

    // Revoke access
    _el('revokeDoctorAccessButton')?.addEventListener('click', async () => {
        if (!confirm('Відкликати доступ? Лікар повернеться до списку заявок.')) return;
        const { error } = await supabase
            .from('anketa_doctor').update({ doctor_check: false }).eq('user_id', currentDoctorId);
        if (!error) {
            alert('Доступ відкликано.');
            _closeModal();
            fetchDoctors();
            _updateNewAppsCount();
        } else { alert(`Помилка: ${error.message}`); }
    });

    // Delete doctor
    _el('deleteDoctorProfileButton')?.addEventListener('click', async () => {
        if (!confirm('ПОВНІСТЮ видалити лікаря? Цю дію неможливо скасувати.')) return;
        const { error } = await supabase
            .from('anketa_doctor').delete().eq('user_id', currentDoctorId);
        if (!error) {
            alert('Лікаря видалено.');
            _closeModal();
            fetchDoctors();
        } else { alert(`Помилка: ${error.message}`); }
    });

    // Date filter in modal
    _el('filterConsultationsBtn')?.addEventListener('click', () => {
        fetchDoctorConsultations(
            currentDoctorId,
            _el('consultationDateFrom')?.value || null,
            _el('consultationDateTo')?.value   || null
        );
    });

    // Order buttons in doctor list
    document.getElementById('doctorsList')?.addEventListener('click', e => {
        const btn = e.target.closest('.order-btn');
        if (btn) {
            e.stopPropagation();
            changeDoctorOrder(btn.dataset.id, btn.classList.contains('up-btn') ? 'up' : 'down');
        }
    });

    // Specialization filter dropdown
    document.getElementById('specializationFilter')?.addEventListener('change', e => {
        fetchDoctors(e.target.value || null);
    });
};

// ─── New doctor applications ──────────────────────────────────────────────────

export const fetchNewDoctorApplications = async () => {
    const list = document.getElementById('newDoctorApplicationsList');
    if (!list) return;
    list.innerHTML = '<li>Завантаження...</li>';

    const { data } = await supabase
        .from('anketa_doctor').select('*').eq('doctor_check', false);

    list.innerHTML = data?.length ? '' : '<li>Нових заявок немає.</li>';
    data?.forEach(doc => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${doc.full_name}</strong> (${doc.email})`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => showDoctorDetails(doc.user_id));
        list.appendChild(li);
    });
};

export const fetchNewDoctorApplicationsCount = async () => {
    const span = document.getElementById('newApplicationsCount');
    if (!span) return;
    const { count } = await supabase
        .from('anketa_doctor')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_check', false);
    span.textContent    = count || 0;
    span.style.display  = count > 0 ? 'inline-block' : 'none';
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const _el = (id) => document.getElementById(id);
const _closeModal = () => {
    const modal = _el('doctorDetailsModal');
    if (modal) modal.style.display = 'none';
};
const _updateNewAppsCount = () => {
    fetchNewDoctorApplications();
    fetchNewDoctorApplicationsCount();
};