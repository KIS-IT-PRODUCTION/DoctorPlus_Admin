// Підключаємо наші модулі
import { supabase, SEND_NOTIFICATION_URL, SUPABASE_STORAGE_BUCKET } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ------------------------------------------------------------------
    // 1. ОТРИМАННЯ ЕЛЕМЕНТІВ DOM
    // ------------------------------------------------------------------

    const adminNameSpan          = document.getElementById('adminName');
    const adminCreationDateSpan  = document.getElementById('adminCreationDate');
    const logoutButton           = document.getElementById('logoutButton');

    // Навігація — точно по HTML id
    const navButtons = {
        showPatients:               document.getElementById('showPatients'),
        showDoctors:                document.getElementById('showDoctors'),
        showNewDoctorApplications:  document.getElementById('showNewDoctorApplications'),
        showAllConsultations:       document.getElementById('showAllConsultations'),   // ← окрема секція в HTML
        showNotifications:          document.getElementById('showNotifications'),
        showFaq:                    document.getElementById('showFaq'),
        showReviews:                document.getElementById('showReviews'),
        showUserHelp:               document.getElementById('showUserHelp'),
        showMainScreenSettings:     document.getElementById('showMainScreenSettings'),
        showExportData:             document.getElementById('showExportData'),
        showSpecializations:        document.getElementById('showSpecializations'),
    };

    // Секції — точно по HTML id
    const sections = {
        patients:               document.getElementById('patientsSection'),
        doctors:                document.getElementById('doctorsSection'),
        newDoctorApplications:  document.getElementById('newDoctorApplicationsSection'),
        allConsultations:       document.getElementById('allConsultationsSection'),    // ← id у HTML
        notifications:          document.getElementById('notificationsSection'),
        faq:                    document.getElementById('faqSection'),
        reviews:                document.getElementById('reviewsSection'),
        userHelp:               document.getElementById('userHelpSection'),
        mainScreenSettings:     document.getElementById('mainScreenSettingsSection'),
        exportData:             document.getElementById('exportDataSection'),
        specializations:        document.getElementById('specializationsSection'),
    };

    // Списки
    const patientsList               = document.getElementById('patientsList');
    const doctorsList                = document.getElementById('doctorsList');
    const newDoctorApplicationsList  = document.getElementById('newDoctorApplicationsList');
    const newApplicationsCountSpan   = document.getElementById('newApplicationsCount');
    const faqList                    = document.getElementById('faqList');
    const reviewsListAdmin           = document.getElementById('reviewsListAdmin');
    const userHelpList               = document.getElementById('userHelpList');

    // Глобальна таблиця консультацій — точно по HTML id
    const allConsultationsList       = document.getElementById('allConsultationsList');       // <tbody>
    const allConsultationsTable      = document.getElementById('allConsultationsTable');      // <table>
    const globalConsultationDateFrom = document.getElementById('globalConsultationDateFrom');
    const globalConsultationDateTo   = document.getElementById('globalConsultationDateTo');
    const filterGlobalConsultationsBtn = document.getElementById('filterGlobalConsultationsBtn');

    // Кнопки експорту консультацій
    const exportConsultationsPdf = document.getElementById('exportConsultationsPdf');
    const exportConsultationsDoc = document.getElementById('exportConsultationsDoc');

    // Кнопки експорту даних користувачів (окрема секція exportData)
    const exportDataType    = document.getElementById('exportDataType');
    const exportSelectedCsv = document.getElementById('exportSelectedCsv');
    const exportSelectedPdf = document.getElementById('exportSelectedPdf');
    const exportStatus      = document.getElementById('exportStatus');

    // Фільтр спеціалізації
    const specializationFilter = document.getElementById('specializationFilter');

    // Форма сповіщень
    const notificationForm    = document.getElementById('notificationForm');
    const notificationTarget  = document.getElementById('notificationTarget');
    const notificationTitle   = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationStatus  = document.getElementById('notificationStatus');
    const specificIdInput     = document.getElementById('specificId');

    // Форма FAQ
    const faqForm            = document.getElementById('faqForm');
    const faqIdInput         = document.getElementById('faqId');
    const faqQuestionUkInput = document.getElementById('faqQuestionUk');
    const faqAnswerUkInput   = document.getElementById('faqAnswerUk');
    const faqQuestionEnInput = document.getElementById('faqQuestionEn');
    const faqAnswerEnInput   = document.getElementById('faqAnswerEn');
    const clearFaqFormBtn    = document.getElementById('clearFaqForm');

    // Форма налаштувань головного екрану
    const mainScreenImageForm           = document.getElementById('mainScreenImageForm');
    const currentMainScreenImageUrlInput = document.getElementById('currentMainScreenImageUrl');
    const viewCurrentImageLink          = document.getElementById('viewCurrentImageLink');
    const newMainScreenImageInput       = document.getElementById('newMainScreenImage');
    const mainScreenImageStatus         = document.getElementById('mainScreenImageStatus');
    const introMottoTextForm            = document.getElementById('introMottoTextForm');
    const currentIntroMottoTextUk       = document.getElementById('currentIntroMottoTextUk');
    const currentIntroMottoTextEn       = document.getElementById('currentIntroMottoTextEn');
    const introMottoTextStatus          = document.getElementById('introMottoTextStatus');

    // Модалка звернень
    const replyModal                  = document.getElementById('replyModal');
    const replyUserEmailDisplay       = document.getElementById('replyUserEmailDisplay');
    const originalUserMessageDisplay  = document.getElementById('originalUserMessageDisplay');
    const currentReplyStatusSpan      = document.getElementById('currentReplyStatus');
    const toggleResolvedButton        = document.getElementById('toggleResolvedButton');
    const toggleResolvedText          = document.getElementById('toggleResolvedText');

    // Модалка лікаря
    const doctorDetailsModal       = document.getElementById('doctorDetailsModal');
    const doctorAvatar             = document.getElementById('doctorAvatar');
    const inputFullName            = document.getElementById('inputFullName');
    const inputEmail               = document.getElementById('inputEmail');
    const inputPhone               = document.getElementById('inputPhone');
    const inputCountry             = document.getElementById('inputCountry');
    const inputLanguages           = document.getElementById('inputLanguages');
    const inputExperience          = document.getElementById('inputExperience');
    const inputEducation           = document.getElementById('inputEducation');
    const inputAchievements        = document.getElementById('inputAchievements');
    const inputAboutMe             = document.getElementById('inputAboutMe');
    const inputConsultationCost    = document.getElementById('inputConsultationCost');
    const inputConsultationCostRange = document.getElementById('inputConsultationCostRange');
    const inputSearchTags          = document.getElementById('inputSearchTags');
    const inputBankDetails         = document.getElementById('inputBankDetails');
    const inputDisplayOrder        = document.getElementById('inputDisplayOrder');
    const detailCertificate        = document.getElementById('detailCertificate');
    const detailDiploma            = document.getElementById('detailDiploma');
    const displayDoctorCheck       = document.getElementById('displayDoctorCheck');
    const doctorProfileStatus      = document.getElementById('doctorProfileStatus');

    // Кнопки в модалці лікаря
    const approveDoctorButton      = document.getElementById('approveDoctorButton');
    const rejectDoctorButton       = document.getElementById('rejectDoctorButton');
    const saveDoctorProfileButton  = document.getElementById('saveDoctorProfileButton');
    const revokeDoctorAccessButton = document.getElementById('revokeDoctorAccessButton');
    const deleteDoctorProfileButton = document.getElementById('deleteDoctorProfileButton');
    const rejectionReasonGroup     = document.getElementById('rejectionReasonGroup');
    const rejectionReasonInput     = document.getElementById('rejectionReason');
    const sendRejectionButton      = document.getElementById('sendRejectionButton');

    // Консультації в модалці лікаря
    const doctorConsultationsList = document.getElementById('doctorConsultationsList'); // <tbody>
    const consultationDateFrom    = document.getElementById('consultationDateFrom');
    const consultationDateTo      = document.getElementById('consultationDateTo');
    const filterConsultationsBtn  = document.getElementById('filterConsultationsBtn');

    const closeButtons = document.querySelectorAll('.close-button');

    let currentDoctorId      = null;
    let currentHelpRequestId = null;

    // ------------------------------------------------------------------
    // 2. ДОПОМІЖНІ ФУНКЦІЇ
    // ------------------------------------------------------------------

    const showSection = (sectionKey) => {
        Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });
        Object.values(navButtons).forEach(b => { if (b) b.classList.remove('active'); });
        if (sections[sectionKey]) sections[sectionKey].style.display = 'block';
        // Знаходимо відповідну кнопку: 'allConsultations' → 'showAllConsultations'
        const btnKey = 'show' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
        if (navButtons[btnKey]) navButtons[btnKey].classList.add('active');
        if (doctorDetailsModal) doctorDetailsModal.style.display = 'none';
        if (replyModal) replyModal.style.display = 'none';
    };

    const formatArr = (val) => Array.isArray(val) ? JSON.stringify(val) : (val || '');

    const parseArray = (val) => {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
    };

    // ------------------------------------------------------------------
    // 3. ПЕРЕВІРКА АДМІНА
    // ------------------------------------------------------------------

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = 'index.html'; return; }

        const { data: adminProfile, error } = await supabase
            .from('profiles_admin').select('*').eq('user_id', user.id).single();

        if (error || !adminProfile) {
            alert('Немає прав доступу.');
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        } else {
            adminNameSpan.textContent = adminProfile.full_name;
            adminCreationDateSpan.textContent = `(${new Date(adminProfile.created_at).toLocaleDateString()})`;
            fetchNewDoctorApplicationsCount();
        }
    };

    // ------------------------------------------------------------------
    // 4. ПАЦІЄНТИ
    // ------------------------------------------------------------------

    const fetchPatients = async () => {
        patientsList.innerHTML = '<li>Завантаження...</li>';
        const { data: profiles, error } = await supabase
            .from('profiles').select('*').order('created_at', { ascending: false });
        if (error) { patientsList.innerHTML = `<li>Помилка: ${error.message}</li>`; return; }

        const { data: bookings } = await supabase
            .from('patient_bookings').select('patient_id, amount, is_paid').eq('is_paid', true);

        patientsList.innerHTML = profiles.length ? '' : '<li>Пацієнтів немає.</li>';
        profiles.forEach(p => {
            const pBookings = bookings ? bookings.filter(b => b.patient_id === p.user_id) : [];
            const totalSpent = pBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <div><strong>${p.full_name || 'Гість'}</strong><br><small>${p.email}</small></div>
                    <div style="text-align:right;">Витрачено: <strong>${totalSpent} UAH</strong></div>
                </div>`;
            patientsList.appendChild(li);
        });
    };

    // ------------------------------------------------------------------
    // 5. ЛІКАРІ
    // ------------------------------------------------------------------

    const fetchDoctors = async (specFilter = null) => {
        doctorsList.innerHTML = '<li>Завантаження...</li>';
        const { data, error } = await supabase
            .from('anketa_doctor').select('*, display_order')
            .order('display_order', { ascending: true, nullsFirst: false });
        if (error) { doctorsList.innerHTML = '<li>Помилка завантаження.</li>'; return; }

        const filteredData = specFilter
            ? data.filter(d => Array.isArray(d.specialization) && d.specialization.includes(specFilter))
            : data;

        const allSpecs = new Set();
        data.forEach(d => { if (Array.isArray(d.specialization)) d.specialization.forEach(s => allSpecs.add(s)); });
        updateSpecializationFilter(allSpecs, specFilter);

        doctorsList.innerHTML = filteredData.length ? '' : '<li>Лікарів не знайдено.</li>';
        filteredData.forEach(doc => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.innerHTML = `
                <div class="doctor-info" style="flex-grow:1; cursor:pointer;">
                    <span class="order-badge">#${doc.display_order || '-'}</span>
                    <strong>${doc.full_name}</strong> <small>(${doc.email})</small>
                    <span style="float:right; color:${doc.doctor_check ? 'green' : 'red'}">${doc.doctor_check ? '✔' : '⏳'}</span>
                </div>
                <div class="order-controls">
                    <button class="order-btn up-btn" data-id="${doc.user_id}">▲</button>
                    <button class="order-btn down-btn" data-id="${doc.user_id}">▼</button>
                </div>`;
            li.querySelector('.doctor-info').addEventListener('click', () => showDoctorDetails(doc.user_id));
            doctorsList.appendChild(li);
        });
    };

    const updateSpecializationFilter = (specs, current) => {
        specializationFilter.innerHTML = '<option value="">Всі спеціалізації</option>';
        Array.from(specs).sort().forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === current) opt.selected = true;
            specializationFilter.appendChild(opt);
        });
    };

    const changeDoctorOrder = async (userId, direction) => {
        const { data: cur } = await supabase.from('anketa_doctor')
            .select('user_id, display_order').eq('user_id', userId).single();
        if (!cur || cur.display_order === null) return;

        const targetOrder = direction === 'up' ? cur.display_order - 1 : cur.display_order + 1;
        if (targetOrder < 1) return;

        const { data: swap } = await supabase.from('anketa_doctor')
            .select('user_id, display_order').eq('display_order', targetOrder).single();

        if (swap) {
            await supabase.from('anketa_doctor').update({ display_order: -1 }).eq('user_id', swap.user_id);
            await supabase.from('anketa_doctor').update({ display_order: targetOrder }).eq('user_id', userId);
            await supabase.from('anketa_doctor').update({ display_order: cur.display_order }).eq('user_id', swap.user_id);
        } else {
            await supabase.from('anketa_doctor').update({ display_order: targetOrder }).eq('user_id', userId);
        }
        fetchDoctors(specializationFilter.value);
    };

    // ------------------------------------------------------------------
    // 6. НОВІ ЗАЯВКИ
    // ------------------------------------------------------------------

    const fetchNewDoctorApplications = async () => {
        newDoctorApplicationsList.innerHTML = '<li>Завантаження...</li>';
        const { data } = await supabase.from('anketa_doctor').select('*').eq('doctor_check', false);
        newDoctorApplicationsList.innerHTML = (data && data.length) ? '' : '<li>Нових заявок немає.</li>';
        if (data) data.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${doc.full_name}</strong> (${doc.email})`;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => showDoctorDetails(doc.user_id));
            newDoctorApplicationsList.appendChild(li);
        });
    };

    const fetchNewDoctorApplicationsCount = async () => {
        const { count } = await supabase.from('anketa_doctor')
            .select('*', { count: 'exact', head: true }).eq('doctor_check', false);
        newApplicationsCountSpan.textContent = count || 0;
        newApplicationsCountSpan.style.display = count > 0 ? 'inline-block' : 'none';
    };

    // ------------------------------------------------------------------
    // 7. ГЛОБАЛЬНА ТАБЛИЦЯ ВСІХ КОНСУЛЬТАЦІЙ
    //    tbody = #allConsultationsList  (точно по HTML)
    // ------------------------------------------------------------------

    const fetchAllConsultations = async (dateFrom = null, dateTo = null) => {
        if (!allConsultationsList) return;
        allConsultationsList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Завантаження...</td></tr>';

        let query = supabase
            .from('patient_bookings')
            .select(`
                booking_date,
                booking_time_slot,
                amount,
                status,
                is_paid,
                profiles:patient_id   (full_name, email),
                anketa_doctor:doctor_id (full_name)
            `)
            .order('booking_date', { ascending: false });

        if (dateFrom) query = query.gte('booking_date', dateFrom);
        if (dateTo)   query = query.lte('booking_date', dateTo);

        const { data, error } = await query;

        if (error) {
            console.error('fetchAllConsultations:', error.message);
            allConsultationsList.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Помилка: ${error.message}</td></tr>`;
            return;
        }
        if (!data || data.length === 0) {
            allConsultationsList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Консультацій не знайдено.</td></tr>';
            return;
        }

        allConsultationsList.innerHTML = '';
        data.forEach(row => {
            const patientName = row.profiles    ? row.profiles.full_name    : 'Гість';
            const doctorName  = row.anketa_doctor ? row.anketa_doctor.full_name : '-';
            const paidMark    = row.is_paid ? '✔' : '✖';
            let timeStr = row.booking_time_slot || '';
            if (timeStr.length > 5) timeStr = timeStr.substring(0, 5);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(row.booking_date).toLocaleDateString()} ${timeStr}</td>
                <td>${doctorName}</td>
                <td>${patientName}</td>
                <td><span class="status-badge status-${row.status || 'pending'}">${row.status || '-'}</span></td>
                <td>${row.amount} UAH <span style="color:${row.is_paid?'green':'red'}">${paidMark}</span></td>`;
            allConsultationsList.appendChild(tr);
        });
    };

    // ------------------------------------------------------------------
    // 8. КОНСУЛЬТАЦІЇ ЛІКАРЯ В МОДАЛЦІ
    //    tbody = #doctorConsultationsList  (точно по HTML)
    // ------------------------------------------------------------------

    const fetchDoctorConsultations = async (doctorId, dateFrom = null, dateTo = null) => {
        if (!doctorConsultationsList) return;
        doctorConsultationsList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Завантаження...</td></tr>';

        let query = supabase
            .from('patient_bookings')
            .select(`
                booking_date,
                booking_time_slot,
                amount,
                status,
                is_paid,
                profiles:patient_id (full_name)
            `)
            .eq('doctor_id', doctorId)
            .order('booking_date', { ascending: false });

        if (dateFrom) query = query.gte('booking_date', dateFrom);
        if (dateTo)   query = query.lte('booking_date', dateTo);

        const { data, error } = await query;

        if (error) {
            console.error('fetchDoctorConsultations:', error.message);
            doctorConsultationsList.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Помилка: ${error.message}</td></tr>`;
            return;
        }
        if (!data || data.length === 0) {
            doctorConsultationsList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Консультацій не знайдено.</td></tr>';
            return;
        }

        doctorConsultationsList.innerHTML = '';
        data.forEach(row => {
            const patientName = row.profiles ? row.profiles.full_name : 'Гість';
            const paidIcon    = row.is_paid
                ? '<span style="color:green">✔</span>'
                : '<span style="color:red">✖</span>';
            let timeStr = row.booking_time_slot || '-';
            if (timeStr.length > 5) timeStr = timeStr.substring(0, 5);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(row.booking_date).toLocaleDateString()} ${timeStr}</td>
                <td>${patientName}</td>
                <td><span class="status-badge status-${row.status || 'pending'}">${row.status || '-'}</span></td>
                <td>${row.amount} UAH ${paidIcon}</td>`;
            doctorConsultationsList.appendChild(tr);
        });
    };

    // ------------------------------------------------------------------
    // 9. FAQ / REVIEWS / HELP
    // ------------------------------------------------------------------

    const fetchFaqsAdmin = async () => {
        faqList.innerHTML = '';
        const { data } = await supabase.from('faqs').select('*').order('id');
        if (data) data.forEach(f => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${f.id}</td>
                <td>${f.question_uk}</td>
                <td>
                    <button class="edit-btn" data-id="${f.id}">✎</button>
                    <button class="delete-btn" data-id="${f.id}">🗑</button>
                </td>`;
            faqList.appendChild(tr);
        });
    };

    const fetchReviewsAdmin = async () => {
        reviewsListAdmin.innerHTML = '';
        const { data } = await supabase.from('app_reviews').select('*').order('created_at', { ascending: false });
        if (data) data.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${r.user_name}</td>
                <td>${r.rating}★</td>
                <td>${r.description}</td>
                <td><button class="delete-btn" data-id="${r.id}">🗑</button></td>`;
            reviewsListAdmin.appendChild(tr);
        });
    };

    const fetchUserHelp = async () => {
        userHelpList.innerHTML = '';
        const { data } = await supabase.from('user_help').select('*').order('created_at', { ascending: false });
        if (data) data.forEach(h => {
            const tr = document.createElement('tr');
            if (h.is_resolved) tr.classList.add('resolved-row');
            tr.innerHTML = `
                <td>${new Date(h.created_at).toLocaleDateString()}</td>
                <td>${h.email}</td>
                <td>${h.type || 'Питання'}</td>
                <td>${h.message.substring(0, 30)}...</td>
                <td>${h.is_resolved ? '✔ Вирішено' : '⏳ В процесі'}</td>
                <td><button class="reply-btn"
                    data-id="${h.id}"
                    data-email="${h.email}"
                    data-msg="${encodeURIComponent(h.message)}"
                    data-res="${h.is_resolved}">Деталі</button></td>`;
            userHelpList.appendChild(tr);
        });
    };

    // ------------------------------------------------------------------
    // 10. НАЛАШТУВАННЯ ГОЛОВНОГО ЕКРАНУ
    // ------------------------------------------------------------------

    const fetchMainScreenSettings = async () => {
        const { data: img } = await supabase.from('app_settings')
            .select('setting_value').eq('setting_name', 'main_screen_image_url').single();
        if (img) {
            currentMainScreenImageUrlInput.value = img.setting_value;
            viewCurrentImageLink.href = img.setting_value;
            viewCurrentImageLink.style.display = 'inline-block';
        }
        const { data: ua } = await supabase.from('app_settings')
            .select('setting_value').eq('setting_name', 'intro_motto_text_uk').single();
        if (ua) currentIntroMottoTextUk.value = ua.setting_value;

        const { data: en } = await supabase.from('app_settings')
            .select('setting_value').eq('setting_name', 'intro_motto_text_en').single();
        if (en) currentIntroMottoTextEn.value = en.setting_value;
    };

    // ------------------------------------------------------------------
    // 11. ДЕТАЛІ ЛІКАРЯ (МОДАЛКА)
    // ------------------------------------------------------------------

    const showDoctorDetails = async (userId) => {
        currentDoctorId = userId;
        doctorProfileStatus.textContent = '';
        rejectionReasonGroup.style.display = 'none';
        saveDoctorProfileButton.style.display = 'inline-block';
        approveDoctorButton.style.display = 'none';
        rejectDoctorButton.style.display = 'none';
        if (consultationDateFrom) consultationDateFrom.value = '';
        if (consultationDateTo)   consultationDateTo.value   = '';

        const { data, error } = await supabase.from('anketa_doctor').select('*').eq('user_id', userId).single();
        if (error) { alert('Помилка завантаження.'); return; }

        doctorAvatar.src              = data.avatar_url || 'placeholder.jpg';
        inputFullName.value           = data.full_name || '';
        inputEmail.value              = data.email || '';
        inputPhone.value              = data.phone || '';
        inputCountry.value            = data.country || '';
        inputLanguages.value          = formatArr(data.communication_languages);
        inputSearchTags.value         = formatArr(data.search_tags);

        // Будуємо чекбокси спеціальностей з поточними значеннями лікаря
        const currentSpecs = Array.isArray(data.specialization) ? data.specialization : [];
        await buildSpecializationCheckboxes(currentSpecs);
        inputExperience.value         = data.experience_years || '';
        inputEducation.value          = data.education || '';
        inputAchievements.value       = data.achievements || '';
        inputAboutMe.value            = data.about_me || '';
        inputConsultationCost.value   = data.consultation_cost || '';
        inputConsultationCostRange.value = data.consultation_cost_range || '';
        inputBankDetails.value        = data.bank_details || '';
        inputDisplayOrder.value       = data.display_order || '';
        detailCertificate.href        = data.certificate_photo_url || '#';
        detailDiploma.href            = data.diploma_url || '#';
        displayDoctorCheck.textContent = data.doctor_check ? 'Так' : 'Ні';

        if (!data.doctor_check) {
            approveDoctorButton.style.display = 'inline-block';
            rejectDoctorButton.style.display  = 'inline-block';
        }

        await fetchDoctorConsultations(userId);
        doctorDetailsModal.style.display = 'block';
    };

    // ------------------------------------------------------------------
    // 12. ЕКСПОРТ КОНСУЛЬТАЦІЙ (PDF / DOC)
    //     PDF — через html2canvas (повна підтримка кирилиці)
    //     DOC — через Blob з UTF-8 charset
    // ------------------------------------------------------------------

    // Допоміжна: збираємо дані з DOM таблиці в чистий масив
    const getTableData = (tableId) => {
        const table = document.getElementById(tableId);
        if (!table) return { headers: [], rows: [] };
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rows    = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        );
        return { headers, rows };
    };

    // Рендеримо красиву HTML-таблицю в прихованому div → canvas → PDF
    const renderTableToPdf = async (tableId, title, orientation = 'landscape') => {
        const { headers, rows } = getTableData(tableId);
        if (!rows.length) { alert('Немає даних для експорту. Спочатку завантажте дані.'); return; }

        const printDiv = document.createElement('div');
        printDiv.style.cssText = `
            position:fixed; top:-9999px; left:-9999px;
            width:${orientation === 'landscape' ? 1200 : 900}px;
            background:white; padding:30px;
            font-family:Arial,sans-serif; font-size:13px; color:#000;
        `;
        printDiv.innerHTML = `
            <h2 style="margin:0 0 6px 0;font-size:17px;color:#2c3e50;">${title}</h2>
            <p style="margin:0 0 14px 0;color:#666;font-size:11px;">
                Дата формування: ${new Date().toLocaleDateString('uk-UA')}
            </p>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>${headers.map(h =>
                        `<th style="background:#2980b9;color:#fff;padding:9px 7px;text-align:left;font-size:11px;border:1px solid #1a5276;">${h}</th>`
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

        const { jsPDF } = window.jspdf;
        const pdf       = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        const pageW     = pdf.internal.pageSize.getWidth();
        const pageH     = pdf.internal.pageSize.getHeight();
        const imgW      = pageW - 20;
        const imgH      = (canvas.height * imgW) / canvas.width;

        // Розбивка на сторінки якщо таблиця велика
        let yPos = 10, remaining = imgH;
        while (remaining > 0) {
            const sliceH  = Math.min(remaining, pageH - 20);
            const srcY    = (imgH - remaining) * (canvas.height / imgH);
            const srcH    = sliceH * (canvas.height / imgH);
            const sc      = document.createElement('canvas');
            sc.width  = canvas.width;
            sc.height = srcH;
            sc.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
            pdf.addImage(sc.toDataURL('image/png'), 'PNG', 10, yPos, imgW, sliceH);
            remaining -= sliceH;
            if (remaining > 0) { pdf.addPage(); yPos = 10; }
        }

        return pdf;
    };

    if (exportConsultationsPdf) {
        exportConsultationsPdf.addEventListener('click', async () => {
            exportConsultationsPdf.disabled = true;
            exportConsultationsPdf.innerHTML = '⏳ Формування...';
            try {
                const pdf = await renderTableToPdf('allConsultationsTable', 'Звіт: Усі консультації лікарів', 'landscape');
                if (pdf) pdf.save(`consultations-${new Date().toISOString().slice(0,10)}.pdf`);
            } catch (err) {
                console.error('PDF export:', err);
                alert(`Помилка: ${err.message}`);
            } finally {
                exportConsultationsPdf.disabled = false;
                exportConsultationsPdf.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
            }
        });
    }

    if (exportConsultationsDoc) {
        exportConsultationsDoc.addEventListener('click', () => {
            const { headers, rows } = getTableData('allConsultationsTable');
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
                    <title>Consultations Report</title>
                    <style>
                        body  { font-family: Arial, sans-serif; font-size: 11pt; }
                        h2    { color: #2c3e50; font-size: 15pt; }
                        p     { color: #666; font-size: 10pt; margin-bottom: 10pt; }
                        table { border-collapse: collapse; width: 100%; }
                        th    { background: #2980b9; color: white; padding: 8pt; text-align: left; border: 1pt solid #1a5276; font-size: 10pt; }
                        td    { padding: 7pt; border: 1pt solid #dee2e6; font-size: 10pt; }
                        tr:nth-child(even) td { background: #eef5fc; }
                    </style>
                </head>
                <body>
                    <h2>Звіт: Усі консультації лікарів</h2>
                    <p>Дата формування: ${new Date().toLocaleDateString('uk-UA')}</p>
                    ${tableHtml}
                </body></html>`;

            const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url; a.download = `consultations-${new Date().toISOString().slice(0,10)}.doc`;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        });
    }

    // ------------------------------------------------------------------
    // 13. ЕКСПОРТ ДАНИХ КОРИСТУВАЧІВ (CSV / PDF) — секція exportData
    // ------------------------------------------------------------------

    const getUserExportData = async () => {
        const type = exportDataType ? exportDataType.value : 'all_users';
        let patients = [], doctors = [];

        if (type === 'all_users' || type === 'patients') {
            const { data } = await supabase.from('profiles').select('full_name, email, created_at');
            patients = (data || []).map(r => ({ ...r, role: 'Пацієнт' }));
        }
        if (type === 'all_users' || type === 'doctors') {
            const { data } = await supabase.from('anketa_doctor').select('full_name, email, created_at');
            doctors = (data || []).map(r => ({ ...r, role: 'Лікар' }));
        }
        return [...patients, ...doctors];
    };

    if (exportSelectedCsv) {
        exportSelectedCsv.addEventListener('click', async () => {
            if (exportStatus) exportStatus.textContent = 'Формування CSV...';
            const rows = await getUserExportData();
            if (!rows.length) { if (exportStatus) exportStatus.textContent = 'Немає даних.'; return; }
            const header = 'Повне ім\'я,Email,Роль,Дата реєстрації';
            const csv = [header, ...rows.map(r =>
                `"${r.full_name || ''}","${r.email || ''}","${r.role}","${new Date(r.created_at).toLocaleDateString()}"`
            )].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `users-export-${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            if (exportStatus) exportStatus.textContent = 'CSV завантажено!';
        });
    }

    if (exportSelectedPdf) {
        exportSelectedPdf.addEventListener('click', async () => {
            if (exportStatus) exportStatus.textContent = 'Формування PDF...';
            exportSelectedPdf.disabled = true;
            try {
                const rows = await getUserExportData();
                if (!rows.length) { if (exportStatus) exportStatus.textContent = 'Немає даних.'; return; }

                const printDiv = document.createElement('div');
                printDiv.style.cssText = `
                    position:fixed; top:-9999px; left:-9999px;
                    width:900px; background:white; padding:30px;
                    font-family:Arial,sans-serif; font-size:13px; color:#000;
                `;
                printDiv.innerHTML = `
                    <h2 style="margin:0 0 6px 0;font-size:17px;color:#2c3e50;">Експорт Користувачів</h2>
                    <p style="margin:0 0 14px 0;color:#666;font-size:11px;">Дата: ${new Date().toLocaleDateString('uk-UA')}</p>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>${['Повне ім\'я','Email','Роль','Дата реєстрації'].map(h =>
                                `<th style="background:#2980b9;color:#fff;padding:9px 7px;text-align:left;font-size:11px;border:1px solid #1a5276;">${h}</th>`
                            ).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.map((r, i) => `
                                <tr style="background:${i % 2 === 0 ? '#fff' : '#eef5fc'};">
                                    <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${r.full_name || '-'}</td>
                                    <td style="padding:7px;border:1px solid #dee2e6;font-size:11px;">${r.email || '-'}</td>
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
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, Math.min(imgH, pdf.internal.pageSize.getHeight() - 20));
                pdf.save(`users-export-${new Date().toISOString().slice(0,10)}.pdf`);

                if (exportStatus) exportStatus.textContent = 'PDF завантажено!';
            } catch (err) {
                console.error('Users PDF export:', err);
                if (exportStatus) exportStatus.textContent = `Помилка: ${err.message}`;
            } finally {
                exportSelectedPdf.disabled = false;
            }
        });
    }

    // ------------------------------------------------------------------
    // 14. НАВІГАЦІЯ
    // ------------------------------------------------------------------

    Object.keys(navButtons).forEach(key => {
        const btn = navButtons[key];
        if (!btn) return;
        // 'showAllConsultations' → 'allConsultations'
        const sectionKey = key.replace(/^show/, '').replace(/^./, c => c.toLowerCase());

        btn.addEventListener('click', () => {
            showSection(sectionKey);
            if (sectionKey === 'patients')              fetchPatients();
            if (sectionKey === 'doctors')               fetchDoctors(specializationFilter.value);
            if (sectionKey === 'newDoctorApplications') fetchNewDoctorApplications();
            if (sectionKey === 'allConsultations')      fetchAllConsultations(); // ← завантажуємо одразу
            if (sectionKey === 'faq')                   fetchFaqsAdmin();
            if (sectionKey === 'reviews')               fetchReviewsAdmin();
            if (sectionKey === 'userHelp')              fetchUserHelp();
            if (sectionKey === 'mainScreenSettings')    fetchMainScreenSettings();
            if (sectionKey === 'specializations')       fetchSpecializations();
            // exportData — нічого не завантажуємо автоматично, тільки по кнопці
        });
    });

    // ------------------------------------------------------------------
    // 15. ФІЛЬТРИ
    // ------------------------------------------------------------------

    // Глобальні консультації
    if (filterGlobalConsultationsBtn) {
        filterGlobalConsultationsBtn.addEventListener('click', () => {
            fetchAllConsultations(
                globalConsultationDateFrom ? globalConsultationDateFrom.value : null,
                globalConsultationDateTo   ? globalConsultationDateTo.value   : null
            );
        });
    }

    // Консультації в модалці лікаря
    if (filterConsultationsBtn) {
        filterConsultationsBtn.addEventListener('click', () => {
            fetchDoctorConsultations(
                currentDoctorId,
                consultationDateFrom ? consultationDateFrom.value : null,
                consultationDateTo   ? consultationDateTo.value   : null
            );
        });
    }

    // Спеціалізація
    if (specializationFilter) {
        specializationFilter.addEventListener('change', e => fetchDoctors(e.target.value));
    }

    // ------------------------------------------------------------------
    // 16. СПОВІЩЕННЯ
    // ------------------------------------------------------------------

    if (notificationForm) {
        notificationTarget.addEventListener('change', () => {
            const show = notificationTarget.value.includes('specific');
            specificIdInput.style.display = show ? 'block' : 'none';
            specificIdInput.previousElementSibling.style.display = show ? 'block' : 'none';
        });

        notificationForm.addEventListener('submit', async e => {
            e.preventDefault();
            notificationStatus.textContent = 'Відправка...';
            const { data: { session } } = await supabase.auth.getSession();
            try {
                const res = await fetch(SEND_NOTIFICATION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        title: notificationTitle.value,
                        body: notificationMessage.value,
                        recipientType: notificationTarget.value,
                        specificId: specificIdInput.value
                    })
                });
                if (!res.ok) throw new Error('Помилка сервера');
                notificationStatus.textContent = 'Надіслано!';
                notificationForm.reset();
            } catch (err) {
                notificationStatus.textContent = `Помилка: ${err.message}`;
            }
        });
    }

    // ------------------------------------------------------------------
    // 17. FAQ
    // ------------------------------------------------------------------

    if (faqForm) {
        faqForm.addEventListener('submit', async e => {
            e.preventDefault();
            const obj = {
                question_uk: faqQuestionUkInput.value, answer_uk: faqAnswerUkInput.value,
                question_en: faqQuestionEnInput.value, answer_en: faqAnswerEnInput.value
            };
            if (faqIdInput.value) await supabase.from('faqs').update(obj).eq('id', faqIdInput.value);
            else                  await supabase.from('faqs').insert([obj]);
            faqForm.reset(); faqIdInput.value = ''; fetchFaqsAdmin();
        });

        if (clearFaqFormBtn) {
            clearFaqFormBtn.addEventListener('click', () => { faqForm.reset(); faqIdInput.value = ''; });
        }

        faqList.addEventListener('click', async e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('delete-btn')) {
                if (confirm('Видалити FAQ?')) { await supabase.from('faqs').delete().eq('id', id); fetchFaqsAdmin(); }
            } else if (btn.classList.contains('edit-btn')) {
                const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
                faqIdInput.value = data.id;
                faqQuestionUkInput.value = data.question_uk; faqAnswerUkInput.value = data.answer_uk;
                faqQuestionEnInput.value = data.question_en; faqAnswerEnInput.value = data.answer_en;
                faqForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ------------------------------------------------------------------
    // 18. ВІДГУКИ
    // ------------------------------------------------------------------

    if (reviewsListAdmin) {
        reviewsListAdmin.addEventListener('click', async e => {
            if (e.target.classList.contains('delete-btn') && confirm('Видалити відгук?')) {
                await supabase.from('app_reviews').delete().eq('id', e.target.dataset.id);
                fetchReviewsAdmin();
            }
        });
    }

    // ------------------------------------------------------------------
    // 19. ЗВЕРНЕННЯ
    // ------------------------------------------------------------------

    if (userHelpList) {
        userHelpList.addEventListener('click', e => {
            const btn = e.target.closest('.reply-btn');
            if (!btn) return;
            currentHelpRequestId = btn.dataset.id;
            replyUserEmailDisplay.value      = btn.dataset.email;
            originalUserMessageDisplay.value = decodeURIComponent(btn.dataset.msg);
            const isRes = btn.dataset.res === 'true';
            currentReplyStatusSpan.textContent = isRes ? 'Вирішено' : 'В процесі';
            if (toggleResolvedText) toggleResolvedText.textContent = isRes ? 'Позначити як Невирішене' : 'Позначити як Вирішене';
            if (toggleResolvedButton) {
                isRes ? toggleResolvedButton.classList.add('resolved') : toggleResolvedButton.classList.remove('resolved');
            }
            replyModal.style.display = 'block';
        });
    }

    if (toggleResolvedButton) {
        toggleResolvedButton.addEventListener('click', async () => {
            const isResolved = currentReplyStatusSpan.textContent === 'Вирішено';
            await supabase.from('user_help').update({ is_resolved: !isResolved }).eq('id', currentHelpRequestId);
            replyModal.style.display = 'none';
            fetchUserHelp();
        });
    }

    // ------------------------------------------------------------------
    // 20. НАЛАШТУВАННЯ ГОЛОВНОГО ЕКРАНУ
    // ------------------------------------------------------------------

    if (mainScreenImageForm) {
        mainScreenImageForm.addEventListener('submit', async e => {
            e.preventDefault();
            const file = newMainScreenImageInput.files[0];
            if (!file) return;
            mainScreenImageStatus.textContent = 'Завантаження...';
            const fileName = `main_screen_${Date.now()}_${file.name}`;
            const { error: upErr } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(fileName, file);
            if (upErr) { mainScreenImageStatus.textContent = upErr.message; return; }
            const { data: { publicUrl } } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(fileName);
            await supabase.from('app_settings').update({ setting_value: publicUrl }).eq('setting_name', 'main_screen_image_url');
            mainScreenImageStatus.textContent = 'Оновлено!';
            fetchMainScreenSettings();
        });
    }

    if (introMottoTextForm) {
        introMottoTextForm.addEventListener('submit', async e => {
            e.preventDefault();
            await supabase.from('app_settings').update({ setting_value: currentIntroMottoTextUk.value }).eq('setting_name', 'intro_motto_text_uk');
            await supabase.from('app_settings').update({ setting_value: currentIntroMottoTextEn.value }).eq('setting_name', 'intro_motto_text_en');
            introMottoTextStatus.textContent = 'Текст оновлено!';
        });
    }

    // ------------------------------------------------------------------
    // 21. ПРОФІЛЬ ЛІКАРЯ — КНОПКИ В МОДАЛЦІ
    // ------------------------------------------------------------------

    if (saveDoctorProfileButton) {
        saveDoctorProfileButton.addEventListener('click', async () => {
            doctorProfileStatus.textContent = 'Збереження...';
            const updateData = {
                full_name: inputFullName.value, phone: inputPhone.value, country: inputCountry.value,
                communication_languages: parseArray(inputLanguages.value),
                specialization:          getSelectedSpecializations(),
                search_tags:             parseArray(inputSearchTags.value),
                experience_years:   parseInt(inputExperience.value)       || 0,
                education:          inputEducation.value,
                achievements:       inputAchievements.value,
                about_me:           inputAboutMe.value,
                consultation_cost:  parseInt(inputConsultationCost.value) || 0,
                consultation_cost_range: inputConsultationCostRange.value,
                bank_details:       inputBankDetails.value,
                display_order:      parseInt(inputDisplayOrder.value) || null
            };
            const { error } = await supabase.from('anketa_doctor').update(updateData).eq('user_id', currentDoctorId);
            if (error) {
                doctorProfileStatus.textContent = `Помилка: ${error.message}`;
                doctorProfileStatus.style.color = 'red';
            } else {
                doctorProfileStatus.textContent = 'Успішно збережено!';
                doctorProfileStatus.style.color = 'green';
                fetchDoctors(specializationFilter.value);
            }
        });
    }

    if (approveDoctorButton) {
        approveDoctorButton.addEventListener('click', async () => {
            if (!confirm('Схвалити лікаря?')) return;
            const { error } = await supabase.from('anketa_doctor').update({ doctor_check: true }).eq('user_id', currentDoctorId);
            if (!error) {
                alert('Лікаря схвалено!');
                doctorDetailsModal.style.display = 'none';
                fetchNewDoctorApplications();
                fetchNewDoctorApplicationsCount();
                fetchDoctors();
            } else { alert(`Помилка: ${error.message}`); }
        });
    }

    if (rejectDoctorButton) {
        rejectDoctorButton.addEventListener('click', () => {
            rejectionReasonGroup.style.display = 'block';
        });
    }

    if (sendRejectionButton) {
        sendRejectionButton.addEventListener('click', async () => {
            const reason = rejectionReasonInput.value.trim();
            if (!reason) { alert('Вкажіть причину відмови.'); return; }
            const { error } = await supabase.from('anketa_doctor').delete().eq('user_id', currentDoctorId);
            if (!error) {
                alert('Лікаря відхилено.');
                doctorDetailsModal.style.display = 'none';
                fetchNewDoctorApplications();
                fetchNewDoctorApplicationsCount();
            } else { alert(`Помилка: ${error.message}`); }
        });
    }

    if (revokeDoctorAccessButton) {
        revokeDoctorAccessButton.addEventListener('click', async () => {
            if (!confirm('Відкликати доступ? Лікар повернеться до списку заявок.')) return;
            const { error } = await supabase.from('anketa_doctor').update({ doctor_check: false }).eq('user_id', currentDoctorId);
            if (!error) {
                alert('Доступ відкликано.');
                doctorDetailsModal.style.display = 'none';
                fetchDoctors();
                fetchNewDoctorApplicationsCount();
            } else { alert(`Помилка: ${error.message}`); }
        });
    }

    if (deleteDoctorProfileButton) {
        deleteDoctorProfileButton.addEventListener('click', async () => {
            if (!confirm('ПОВНІСТЮ видалити лікаря? Цю дію неможливо скасувати.')) return;
            const { error } = await supabase.from('anketa_doctor').delete().eq('user_id', currentDoctorId);
            if (!error) {
                alert('Лікаря видалено.');
                doctorDetailsModal.style.display = 'none';
                fetchDoctors();
            } else { alert(`Помилка: ${error.message}`); }
        });
    }

    // Сортування лікарів
    if (doctorsList) {
        doctorsList.addEventListener('click', e => {
            const btn = e.target.closest('.order-btn');
            if (btn) {
                e.stopPropagation();
                changeDoctorOrder(btn.dataset.id, btn.classList.contains('up-btn') ? 'up' : 'down');
            }
        });
    }

    // ------------------------------------------------------------------
    // 22. ЗАКРИТТЯ МОДАЛОК
    // ------------------------------------------------------------------

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (doctorDetailsModal) doctorDetailsModal.style.display = 'none';
            if (replyModal)         replyModal.style.display         = 'none';
        });
    });

    window.addEventListener('click', e => {
        if (e.target === doctorDetailsModal) doctorDetailsModal.style.display = 'none';
        if (e.target === replyModal)         replyModal.style.display         = 'none';
    });


    // ------------------------------------------------------------------
    // 24. СПЕЦІАЛЬНОСТІ — CRUD
    // ------------------------------------------------------------------

    const specializationCheckboxList  = document.getElementById('specializationCheckboxList');
    const specializationForm          = document.getElementById('specializationForm');
    const specializationFormTitle     = document.getElementById('specializationFormTitle');
    const specializationIdInput       = document.getElementById('specializationId');
    const specializationNameUk        = document.getElementById('specializationNameUk');
    const specializationNameEn        = document.getElementById('specializationNameEn');
    const specializationIcon          = document.getElementById('specializationIcon');
    const clearSpecializationFormBtn  = document.getElementById('clearSpecializationForm');
    const specializationStatus        = document.getElementById('specializationStatus');
    const specializationsList         = document.getElementById('specializationsList');

    // Завантаження списку спеціальностей
    const fetchSpecializations = async () => {
        if (!specializationsList) return;
        specializationsList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Завантаження...</td></tr>';

        const { data: specs, error } = await supabase
            .from('specializations')
            .select('*')
            .order('name_uk');

        if (error) {
            specializationsList.innerHTML = `<tr><td colspan="6" style="color:red;text-align:center;">Помилка: ${error.message}</td></tr>`;
            return;
        }

        // Рахуємо лікарів на кожну спеціальність
        const { data: doctors } = await supabase
            .from('anketa_doctor')
            .select('specialization')
            .eq('doctor_check', true);

        const doctorCount = {};
        if (doctors) {
            doctors.forEach(d => {
                if (Array.isArray(d.specialization)) {
                    d.specialization.forEach(s => { doctorCount[s] = (doctorCount[s] || 0) + 1; });
                }
            });
        }

        if (!specs || specs.length === 0) {
            specializationsList.innerHTML = '<tr><td colspan="6" style="text-align:center;">Спеціальностей ще немає. Додайте першу!</td></tr>';
            return;
        }

        specializationsList.innerHTML = '';
        specs.forEach(spec => {
            const count = doctorCount[spec.name_uk] || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:1.3em;text-align:center;">${spec.icon || '—'}</td>
                <td><strong>${spec.name_uk}</strong></td>
                <td>${spec.name_en}</td>
                <td style="text-align:center;">
                    <strong style="color:${count > 0 ? '#007bff' : '#999'}">${count}</strong>
                </td>
                <td style="text-align:center;">
                    <span style="
                        display:inline-block; padding:3px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;
                        background:${spec.is_active ? '#d4edda' : '#f8d7da'};
                        color:${spec.is_active ? '#155724' : '#721c24'};">
                        ${spec.is_active ? '✔ Активна' : '✖ Прихована'}
                    </span>
                </td>
                <td>
                    <button class="edit-btn spec-edit-btn" data-id="${spec.id}" title="Редагувати" style="margin-right:4px;">✎</button>
                    <button class="toggle-active-btn spec-toggle-btn"
                        data-id="${spec.id}" data-active="${spec.is_active}"
                        style="background:${spec.is_active ? '#ffc107' : '#28a745'};color:${spec.is_active ? '#333' : '#fff'};border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-right:4px;"
                        title="${spec.is_active ? 'Приховати' : 'Активувати'}">
                        ${spec.is_active ? '🙈 Приховати' : '👁 Показати'}
                    </button>
                    <button class="delete-btn spec-delete-btn" data-id="${spec.id}" data-count="${count}" title="Видалити">🗑</button>
                </td>`;
            specializationsList.appendChild(tr);
        });
    };

    // Будує чекбокси для модалки лікаря
    const buildSpecializationCheckboxes = async (selected = []) => {
        if (!specializationCheckboxList) return;
        specializationCheckboxList.innerHTML = '<span style="color:#aaa;font-size:0.9em;">Завантаження...</span>';

        const { data: specs, error } = await supabase
            .from('specializations')
            .select('id, name_uk, name_en, icon')
            .eq('is_active', true)
            .order('name_uk');

        if (error || !specs || specs.length === 0) {
            specializationCheckboxList.innerHTML = '<span style="color:#999;font-size:0.9em;">Спеціальностей немає — спочатку додайте їх у розділі «Спеціальності».</span>';
            return;
        }

        specializationCheckboxList.innerHTML = '';
        specs.forEach(spec => {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 0;min-width:180px;cursor:pointer;font-size:0.95em;';
            label.innerHTML = `
                <input type="checkbox" name="spec_checkbox" value="${spec.name_uk}"
                    ${selected.includes(spec.name_uk) ? 'checked' : ''}
                    style="width:16px;height:16px;cursor:pointer;accent-color:#007bff;">
                <span>${spec.icon ? spec.icon + ' ' : ''}${spec.name_uk}</span>
                <span style="color:#aaa;font-size:0.8em;">(${spec.name_en})</span>`;
            specializationCheckboxList.appendChild(label);
        });
    };

    const getSelectedSpecializations = () => {
        if (!specializationCheckboxList) return [];
        return Array.from(
            specializationCheckboxList.querySelectorAll('input[name="spec_checkbox"]:checked')
        ).map(cb => cb.value);
    };

    const clearSpecForm = () => {
        if (specializationForm) specializationForm.reset();
        if (specializationIdInput) specializationIdInput.value = '';
        if (specializationFormTitle) specializationFormTitle.textContent = 'Додати нову спеціальність';
        if (specializationStatus) { specializationStatus.textContent = ''; }
    };

    if (specializationForm) {
        specializationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            specializationStatus.textContent = 'Збереження...';
            specializationStatus.style.color = '#333';

            const payload = {
                name_uk: specializationNameUk.value.trim(),
                name_en: specializationNameEn.value.trim(),
                icon:    specializationIcon.value.trim() || null,
            };

            const editId = specializationIdInput.value;
            let error;

            if (editId) {
                ({ error } = await supabase.from('specializations').update(payload).eq('id', editId));
            } else {
                ({ error } = await supabase.from('specializations').insert([{ ...payload, is_active: true }]));
            }

            if (error) {
                specializationStatus.textContent = error.message.includes('unique')
                    ? 'Спеціальність з такою назвою вже існує.'
                    : `Помилка: ${error.message}`;
                specializationStatus.style.color = 'red';
            } else {
                specializationStatus.textContent = editId ? 'Оновлено!' : 'Спеціальність додано!';
                specializationStatus.style.color = 'green';
                clearSpecForm();
                fetchSpecializations();
            }
        });
    }

    if (clearSpecializationFormBtn) {
        clearSpecializationFormBtn.addEventListener('click', clearSpecForm);
    }

    if (specializationsList) {
        specializationsList.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('spec-edit-btn')) {
                const { data } = await supabase.from('specializations').select('*').eq('id', id).single();
                if (!data) return;
                specializationIdInput.value         = data.id;
                specializationNameUk.value          = data.name_uk;
                specializationNameEn.value          = data.name_en;
                specializationIcon.value            = data.icon || '';
                specializationFormTitle.textContent = `Редагування: ${data.name_uk}`;
                specializationStatus.textContent    = '';
                specializationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (btn.classList.contains('spec-toggle-btn')) {
                const isActive = btn.dataset.active === 'true';
                const { error } = await supabase.from('specializations').update({ is_active: !isActive }).eq('id', id);
                if (!error) fetchSpecializations();
                else alert(`Помилка: ${error.message}`);
            }

            if (btn.classList.contains('spec-delete-btn')) {
                const count = parseInt(btn.dataset.count) || 0;
                const warn = count > 0
                    ? `⚠️ ${count} лікар${count === 1 ? '' : 'ів'} мають цю спеціальність.\n\nВидалення не прибере її з профілів лікарів.\n\n`
                    : '';
                if (!confirm(`${warn}Видалити спеціальність? Цю дію неможливо скасувати.`)) return;
                const { error } = await supabase.from('specializations').delete().eq('id', id);
                if (!error) fetchSpecializations();
                else alert(`Помилка: ${error.message}`);
            }
        });
    }


    // ------------------------------------------------------------------
    // 23. СТАРТ
    // ------------------------------------------------------------------

    // Одразу при завантаженні ховаємо модалки
    if (doctorDetailsModal) doctorDetailsModal.style.display = 'none';
    if (replyModal)         replyModal.style.display         = 'none';

    // Ховаємо всі секції, показуємо лише пацієнтів за замовчуванням
    Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });
    if (sections.patients)       sections.patients.style.display = 'block';
    if (navButtons.showPatients) navButtons.showPatients.classList.add('active');

    checkAdminStatus();
    fetchPatients(); // завантажуємо пацієнтів одразу

});