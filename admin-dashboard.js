document.addEventListener('DOMContentLoaded', async () => {

    // ------------------------------------------------------------------
    // 1. КОНФІГУРАЦІЯ ТА ІНІЦІАЛІЗАЦІЯ SUPABASE
    // ------------------------------------------------------------------
    
    const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y';
    
    // Константи
    const SEND_NOTIFICATION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/send-admin-notification';
    const DELETE_AUTH_USER_FUNCTION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/delete-auth-user';
    const SUPABASE_STORAGE_BUCKET = 'public-images';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });

    // ------------------------------------------------------------------
    // 2. ОТРИМАННЯ ЕЛЕМЕНТІВ DOM
    // ------------------------------------------------------------------

    // Хедер
    const adminNameSpan = document.getElementById('adminName');
    const adminCreationDateSpan = document.getElementById('adminCreationDate');
    const logoutButton = document.getElementById('logoutButton');

    // Кнопки навігації
    const navButtons = {
        showPatients: document.getElementById('showPatients'),
        showDoctors: document.getElementById('showDoctors'),
        showNewDoctorApplications: document.getElementById('showNewDoctorApplications'),
        showNotifications: document.getElementById('showNotifications'),
        showFaq: document.getElementById('showFaq'),
        showReviews: document.getElementById('showReviews'),
        showUserHelp: document.getElementById('showUserHelp'),
        showMainScreenSettings: document.getElementById('showMainScreenSettings'),
        showExportData: document.getElementById('showExportData'),
    };

    // Секції
    const sections = {
        patients: document.getElementById('patientsSection'),
        doctors: document.getElementById('doctorsSection'),
        newDoctorApplications: document.getElementById('newDoctorApplicationsSection'),
        notifications: document.getElementById('notificationsSection'),
        faq: document.getElementById('faqSection'),
        reviews: document.getElementById('reviewsSection'),
        userHelp: document.getElementById('userHelpSection'),
        mainScreenSettings: document.getElementById('mainScreenSettingsSection'),
        exportData: document.getElementById('exportDataSection'),
    };

    // Списки
    const patientsList = document.getElementById('patientsList');
    const doctorsList = document.getElementById('doctorsList');
    const newDoctorApplicationsList = document.getElementById('newDoctorApplicationsList');
    const newApplicationsCountSpan = document.getElementById('newApplicationsCount');
    const faqList = document.getElementById('faqList');
    const reviewsListAdmin = document.getElementById('reviewsListAdmin');
    const userHelpList = document.getElementById('userHelpList');

    // Фільтри
    const specializationFilter = document.getElementById('specializationFilter');

    // --- ФОРМИ ---
    const notificationForm = document.getElementById('notificationForm');
    const notificationTarget = document.getElementById('notificationTarget');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationStatus = document.getElementById('notificationStatus');
    const specificIdInput = document.getElementById('specificId');

    // FAQ Form
    const faqForm = document.getElementById('faqForm');
    const faqIdInput = document.getElementById('faqId');
    const faqQuestionUkInput = document.getElementById('faqQuestionUk');
    const faqAnswerUkInput = document.getElementById('faqAnswerUk');
    const faqQuestionEnInput = document.getElementById('faqQuestionEn');
    const faqAnswerEnInput = document.getElementById('faqAnswerEn');
    
    // Settings Form
    const mainScreenImageForm = document.getElementById('mainScreenImageForm');
    const currentMainScreenImageUrlInput = document.getElementById('currentMainScreenImageUrl');
    const viewCurrentImageLink = document.getElementById('viewCurrentImageLink');
    const newMainScreenImageInput = document.getElementById('newMainScreenImage');
    const mainScreenImageStatus = document.getElementById('mainScreenImageStatus');

    const introMottoTextForm = document.getElementById('introMottoTextForm');
    const currentIntroMottoTextUk = document.getElementById('currentIntroMottoTextUk');
    const currentIntroMottoTextEn = document.getElementById('currentIntroMottoTextEn');
    const introMottoTextStatus = document.getElementById('introMottoTextStatus');

    // Export
    const exportDataTypeSelect = document.getElementById('exportDataType');
    const exportSelectedCsvButton = document.getElementById('exportSelectedCsv');
    const exportSelectedPdfButton = document.getElementById('exportSelectedPdf');
    const exportStatus = document.getElementById('exportStatus');

    // --- МОДАЛЬНІ ВІКНА ---
    const replyModal = document.getElementById('replyModal');
    const replyUserEmailDisplay = document.getElementById('replyUserEmailDisplay');
    const originalUserMessageDisplay = document.getElementById('originalUserMessageDisplay');
    const currentReplyStatusSpan = document.getElementById('currentReplyStatus');
    const toggleResolvedButton = document.getElementById('toggleResolvedButton');

    // Doctor Details Modal
    const doctorDetailsModal = document.getElementById('doctorDetailsModal');
    const doctorAvatar = document.getElementById('doctorAvatar');
    const inputFullName = document.getElementById('inputFullName');
    const inputEmail = document.getElementById('inputEmail');
    const inputPhone = document.getElementById('inputPhone');
    const inputCountry = document.getElementById('inputCountry');
    const inputLanguages = document.getElementById('inputLanguages');
    const inputSpecialization = document.getElementById('inputSpecialization');
    const inputExperience = document.getElementById('inputExperience');
    const inputEducation = document.getElementById('inputEducation');
    const inputAchievements = document.getElementById('inputAchievements');
    const inputAboutMe = document.getElementById('inputAboutMe');
    const inputConsultationCost = document.getElementById('inputConsultationCost');
    const inputConsultationCostRange = document.getElementById('inputConsultationCostRange');
    const inputSearchTags = document.getElementById('inputSearchTags');
    const inputBankDetails = document.getElementById('inputBankDetails');
    const inputDisplayOrder = document.getElementById('inputDisplayOrder');
    const detailCertificate = document.getElementById('detailCertificate');
    const detailDiploma = document.getElementById('detailDiploma');
    const displayDoctorCheck = document.getElementById('displayDoctorCheck');

    // Кнопки управління лікарем
    const approveDoctorButton = document.getElementById('approveDoctorButton');
    const rejectDoctorButton = document.getElementById('rejectDoctorButton');
    const saveDoctorProfileButton = document.getElementById('saveDoctorProfileButton');
    const revokeDoctorAccessButton = document.getElementById('revokeDoctorAccessButton');
    const deleteDoctorProfileButton = document.getElementById('deleteDoctorProfileButton');
    const rejectionReasonGroup = document.getElementById('rejectionReasonGroup');
    const rejectionReasonInput = document.getElementById('rejectionReason');
    const sendRejectionButton = document.getElementById('sendRejectionButton');
    const doctorProfileStatus = document.getElementById('doctorProfileStatus');

    // ІСТОРІЯ КОНСУЛЬТАЦІЙ (Елементи)
    const doctorConsultationsList = document.getElementById('doctorConsultationsList');
    const consultationDateFrom = document.getElementById('consultationDateFrom');
    const consultationDateTo = document.getElementById('consultationDateTo');
    const filterConsultationsBtn = document.getElementById('filterConsultationsBtn');

    let currentDoctorId = null;
    let currentHelpRequestId = null;

    // ------------------------------------------------------------------
    // 3. ФУНКЦІЇ ЛОГІКИ
    // ------------------------------------------------------------------

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        const { data: adminProfile, error } = await supabase
            .from('profiles_admin')
            .select('*')
            .eq('user_id', user.id)
            .single();

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

    const showSection = (sectionId) => {
        Object.values(sections).forEach(s => { if(s) s.style.display = 'none'; });
        Object.values(navButtons).forEach(b => { if(b) b.classList.remove('active'); });

        if (sections[sectionId]) sections[sectionId].style.display = 'block';
        const btnId = 'show' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        if (navButtons[btnId]) navButtons[btnId].classList.add('active');

        doctorDetailsModal.style.display = 'none';
        replyModal.style.display = 'none';
    };

    // --- ПАЦІЄНТИ ---
    const fetchPatients = async () => {
        patientsList.innerHTML = '<li>Завантаження...</li>';
        const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        
        if (error) { patientsList.innerHTML = `<li>Помилка: ${error.message}</li>`; return; }

        // Отримуємо статистику оплат
        const { data: bookings } = await supabase.from('patient_bookings').select('patient_id, amount, is_paid').eq('is_paid', true);

        patientsList.innerHTML = profiles.length ? '' : '<li>Пацієнтів немає.</li>';
        
        profiles.forEach(p => {
            const pBookings = bookings ? bookings.filter(b => b.patient_id === p.user_id) : [];
            const totalSpent = pBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <div><strong>${p.full_name || 'Гість'}</strong> <br> <small>${p.email}</small></div>
                    <div style="text-align:right;">Витрачено: <strong>${totalSpent} UAH</strong></div>
                </div>`;
            patientsList.appendChild(li);
        });
    };

    // --- ЛІКАРІ ---
    const fetchDoctors = async (specFilter = null) => {
        doctorsList.innerHTML = '<li>Завантаження...</li>';
        const { data, error } = await supabase.from('anketa_doctor').select('*, display_order').order('display_order', { ascending: true, nullsFirst: false });

        if (error) { doctorsList.innerHTML = '<li>Помилка завантаження.</li>'; return; }

        let filteredData = data;
        if (specFilter) {
            filteredData = data.filter(doc => Array.isArray(doc.specialization) && doc.specialization.includes(specFilter));
        }

        // Оновлення фільтру
        const allSpecs = new Set();
        data.forEach(d => { if(Array.isArray(d.specialization)) d.specialization.forEach(s => allSpecs.add(s)); });
        updateSpecializationFilter(allSpecs, specFilter);

        doctorsList.innerHTML = filteredData.length ? '' : '<li>Лікарів не знайдено.</li>';

        filteredData.forEach(doc => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.innerHTML = `
                <div class="doctor-info" style="flex-grow:1;">
                    <span class="order-badge">#${doc.display_order || '-'}</span>
                    <strong>${doc.full_name}</strong> <small>(${doc.email})</small>
                    <span style="float:right; color:${doc.doctor_check ? 'green':'red'}">${doc.doctor_check ? '✔':'⏳'}</span>
                </div>
                <div class="order-controls">
                    <button class="order-btn up-btn" data-id="${doc.user_id}">▲</button>
                    <button class="order-btn down-btn" data-id="${doc.user_id}">▼</button>
                </div>
            `;
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

    // Сортування
    const changeDoctorOrder = async (userId, direction) => {
        const { data: currentDoc } = await supabase.from('anketa_doctor').select('user_id, display_order').eq('user_id', userId).single();
        if (!currentDoc || currentDoc.display_order === null) return;
        
        const targetOrder = direction === 'up' ? currentDoc.display_order - 1 : currentDoc.display_order + 1;
        if (targetOrder < 1) return;

        const { data: swapDoc } = await supabase.from('anketa_doctor').select('user_id, display_order').eq('display_order', targetOrder).single();
        
        if (swapDoc) {
            await supabase.from('anketa_doctor').update({ display_order: -1 }).eq('user_id', swapDoc.user_id);
            await supabase.from('anketa_doctor').update({ display_order: targetOrder }).eq('user_id', userId);
            await supabase.from('anketa_doctor').update({ display_order: currentDoc.display_order }).eq('user_id', swapDoc.user_id);
        } else {
            await supabase.from('anketa_doctor').update({ display_order: targetOrder }).eq('user_id', userId);
        }
        fetchDoctors(specializationFilter.value);
    };

    doctorsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.order-btn');
        if (btn) {
            e.stopPropagation();
            changeDoctorOrder(btn.dataset.id, btn.classList.contains('up-btn') ? 'up' : 'down');
        }
    });
    specializationFilter.addEventListener('change', (e) => fetchDoctors(e.target.value));

    // --- НОВІ ЗАЯВКИ ---
    const fetchNewDoctorApplications = async () => {
        newDoctorApplicationsList.innerHTML = '<li>Завантаження...</li>';
        const { data } = await supabase.from('anketa_doctor').select('*').eq('doctor_check', false);
        newDoctorApplicationsList.innerHTML = (data && data.length) ? '' : '<li>Нових заявок немає.</li>';
        if(data) data.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${doc.full_name}</strong> (${doc.email})`;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => showDoctorDetails(doc.user_id));
            newDoctorApplicationsList.appendChild(li);
        });
    };

    const fetchNewDoctorApplicationsCount = async () => {
        const { count } = await supabase.from('anketa_doctor').select('*', { count: 'exact', head: true }).eq('doctor_check', false);
        newApplicationsCountSpan.textContent = count || 0;
        newApplicationsCountSpan.style.display = count > 0 ? 'inline-block' : 'none';
    };

    // --- FAQ & REVIEWS & HELP ---
    const fetchFaqsAdmin = async () => {
        faqList.innerHTML = '';
        const { data } = await supabase.from('faqs').select('*').order('id');
        if(data) data.forEach(f => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${f.id}</td><td>${f.question_uk}</td><td><button class="edit-btn" data-id="${f.id}">✎</button> <button class="delete-btn" data-id="${f.id}">🗑</button></td>`;
            faqList.appendChild(tr);
        });
    };

    const fetchReviewsAdmin = async () => {
        reviewsListAdmin.innerHTML = '';
        const { data } = await supabase.from('app_reviews').select('*').order('created_at', { ascending: false });
        if(data) data.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.user_name}</td><td>${r.rating}★</td><td>${r.description}</td><td><button class="delete-btn" data-id="${r.id}">🗑</button></td>`;
            reviewsListAdmin.appendChild(tr);
        });
    };

    const fetchUserHelp = async () => {
        userHelpList.innerHTML = '';
        const { data } = await supabase.from('user_help').select('*').order('created_at', { ascending: false });
        if(data) data.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(h.created_at).toLocaleDateString()}</td>
                <td>${h.email}</td>
                <td>${h.message.substring(0,30)}...</td>
                <td>${h.is_resolved ? '✔' : '⏳'}</td>
                <td><button class="reply-btn" data-id="${h.id}" data-email="${h.email}" data-msg="${h.message}" data-res="${h.is_resolved}">Деталі</button></td>`;
            userHelpList.appendChild(tr);
        });
    };

    // --- НАЛАШТУВАННЯ ---
    const fetchMainScreenSettings = async () => {
        const { data: img } = await supabase.from('app_settings').select('setting_value').eq('setting_name', 'main_screen_image_url').single();
        if(img) { currentMainScreenImageUrlInput.value = img.setting_value; viewCurrentImageLink.href = img.setting_value; viewCurrentImageLink.style.display = 'inline-block'; }
        
        const { data: ua } = await supabase.from('app_settings').select('setting_value').eq('setting_name', 'intro_motto_text_uk').single();
        if(ua) currentIntroMottoTextUk.value = ua.setting_value;
        const { data: en } = await supabase.from('app_settings').select('setting_value').eq('setting_name', 'intro_motto_text_en').single();
        if(en) currentIntroMottoTextEn.value = en.setting_value;
    };

    mainScreenImageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = newMainScreenImageInput.files[0];
        if(!file) return;
        mainScreenImageStatus.textContent = 'Завантаження...';
        const fileName = `main_screen_${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(fileName, file);
        if(upErr) { mainScreenImageStatus.textContent = upErr.message; return; }
        const { data: { publicUrl } } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(fileName);
        await supabase.from('app_settings').update({ setting_value: publicUrl }).eq('setting_name', 'main_screen_image_url');
        mainScreenImageStatus.textContent = 'Оновлено!';
        fetchMainScreenSettings();
    });

    introMottoTextForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await supabase.from('app_settings').update({ setting_value: currentIntroMottoTextUk.value }).eq('setting_name', 'intro_motto_text_uk');
        await supabase.from('app_settings').update({ setting_value: currentIntroMottoTextEn.value }).eq('setting_name', 'intro_motto_text_en');
        introMottoTextStatus.textContent = 'Текст оновлено!';
    });

    // ------------------------------------------------------------------
    // !!! ІСТОРІЯ КОНСУЛЬТАЦІЙ (ВИПРАВЛЕНА ФУНКЦІЯ) !!!
    // ------------------------------------------------------------------
    const fetchDoctorConsultations = async (doctorId, dateFrom = null, dateTo = null) => {
        if (!doctorConsultationsList) return;
        
        doctorConsultationsList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Завантаження...</td></tr>';
        console.log("Отримання консультацій для лікаря:", doctorId);

        // --- ВИПРАВЛЕННЯ: booking_time_slot замість booking_time ---
        // --- ВИПРАВЛЕННЯ: profiles:patient_id для коректного JOIN ---
        let query = supabase.from('patient_bookings')
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
        if (dateTo) query = query.lte('booking_date', dateTo);

        const { data, error } = await query;

        if (error) {
            console.error("Помилка завантаження консультацій:", error);
            doctorConsultationsList.innerHTML = `<tr><td colspan="4" style="color:red;">Помилка: ${error.message}</td></tr>`;
            return;
        }

        if (!data || data.length === 0) {
            doctorConsultationsList.innerHTML = '<tr><td colspan="4" style="text-align:center;">Історія порожня.</td></tr>';
            return;
        }

        doctorConsultationsList.innerHTML = '';
        data.forEach(row => {
            // Безпечно беремо ім'я
            const patientName = row.profiles ? row.profiles.full_name : 'Гість/Видалений';
            // Статус оплати
            const paidIcon = row.is_paid ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>';
            // Час (обрізаємо секунди)
            let timeStr = row.booking_time_slot || '-';
            if (timeStr.length > 5) timeStr = timeStr.substring(0, 5);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(row.booking_date).toLocaleDateString()} ${timeStr}</td>
                <td>${patientName}</td>
                <td>${row.status || '-'}</td>
                <td>${row.amount} UAH ${paidIcon}</td>
            `;
            doctorConsultationsList.appendChild(tr);
        });
    };

    // --- ДЕТАЛІ ЛІКАРЯ ---
    const showDoctorDetails = async (userId) => {
        currentDoctorId = userId;
        
        rejectionReasonGroup.style.display = 'none';
        saveDoctorProfileButton.style.display = 'inline-block';
        approveDoctorButton.style.display = 'none';
        rejectDoctorButton.style.display = 'none';
        
        if(consultationDateFrom) consultationDateFrom.value = '';
        if(consultationDateTo) consultationDateTo.value = '';

        const { data, error } = await supabase.from('anketa_doctor').select('*').eq('user_id', userId).single();
        if (error) return alert('Помилка завантаження.');

        doctorAvatar.src = data.avatar_url || 'placeholder.jpg';
        inputFullName.value = data.full_name || '';
        inputEmail.value = data.email || '';
        inputPhone.value = data.phone || '';
        inputCountry.value = data.country || '';
        
        const formatArr = (val) => Array.isArray(val) ? JSON.stringify(val) : val;
        inputLanguages.value = formatArr(data.communication_languages);
        inputSpecialization.value = formatArr(data.specialization);
        inputSearchTags.value = formatArr(data.search_tags);
        
        inputExperience.value = data.experience_years || '';
        inputEducation.value = data.education || '';
        inputAchievements.value = data.achievements || '';
        inputAboutMe.value = data.about_me || '';
        inputConsultationCost.value = data.consultation_cost || '';
        inputConsultationCostRange.value = data.consultation_cost_range || '';
        inputBankDetails.value = data.bank_details || '';
        inputDisplayOrder.value = data.display_order || '';

        detailCertificate.href = data.certificate_photo_url || '#';
        detailDiploma.href = data.diploma_url || '#';
        displayDoctorCheck.textContent = data.doctor_check ? 'Так' : 'Ні';

        if (!data.doctor_check) {
            approveDoctorButton.style.display = 'inline-block';
            rejectDoctorButton.style.display = 'inline-block';
        }

        // Завантажуємо консультації
        fetchDoctorConsultations(userId);
        doctorDetailsModal.style.display = 'block';
    };

    // --- ЕКСПОРТ (PDF/CSV) ---
    const exportToCsv = async () => {
        const type = exportDataTypeSelect.value;
        exportStatus.textContent = 'Експорт CSV...';
        
        let data = [];
        if (type === 'patients') {
            const { data: res } = await supabase.from('profiles').select('*'); data = res;
        } else {
            const { data: res } = await supabase.from('anketa_doctor').select('*'); data = res;
        }

        if (!data || !data.length) { exportStatus.textContent = 'Дані відсутні'; return; }

        const keys = Object.keys(data[0]);
        const header = keys.join(',');
        const rows = data.map(row => keys.map(k => `"${String(row[k]||'').replace(/"/g,"'")}"`).join(','));
        const csvContent = '\uFEFF' + [header, ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `export_${type}.csv`; a.click();
        exportStatus.textContent = 'CSV готово!';
    };

    const exportToPdf = async () => {
        if (!window.jspdf) return alert('Бібліотека PDF не знайдена');
        const type = exportDataTypeSelect.value;
        exportStatus.textContent = 'Експорт PDF...';

        let data = [];
        if (type === 'patients') {
            const { data: res } = await supabase.from('profiles').select('*'); data = res;
        } else {
            const { data: res } = await supabase.from('anketa_doctor').select('*'); data = res;
        }

        if (!data || !data.length) { exportStatus.textContent = 'Дані відсутні'; return; }

        const doc = new window.jspdf.jsPDF('l');
        const keys = Object.keys(data[0]).slice(0, 5); // беремо перші 5 колонок для PDF
        const body = data.map(row => keys.map(k => String(row[k]||'')));

        doc.text(`Export: ${type}`, 14, 15);
        doc.autoTable({ head: [keys], body: body, startY: 20 });
        doc.save(`export_${type}.pdf`);
        exportStatus.textContent = 'PDF готово!';
    };

    if (exportSelectedCsvButton) exportSelectedCsvButton.addEventListener('click', exportToCsv);
    if (exportSelectedPdfButton) exportSelectedPdfButton.addEventListener('click', exportToPdf);

    // --- ОБРОБНИКИ ПОДІЙ ---
    if(filterConsultationsBtn) {
        filterConsultationsBtn.addEventListener('click', () => {
            fetchDoctorConsultations(currentDoctorId, consultationDateFrom.value, consultationDateTo.value);
        });
    }

    Object.keys(navButtons).forEach(key => {
        const btn = navButtons[key];
        const section = key.replace('show', '').charAt(0).toLowerCase() + key.slice(5);
        btn.addEventListener('click', () => {
            showSection(section);
            if (section === 'patients') fetchPatients();
            if (section === 'doctors') fetchDoctors(specializationFilter.value);
            if (section === 'newDoctorApplications') fetchNewDoctorApplications();
            if (section === 'faq') fetchFaqsAdmin();
            if (section === 'reviews') fetchReviewsAdmin();
            if (section === 'userHelp') fetchUserHelp();
            if (section === 'mainScreenSettings') fetchMainScreenSettings();
        });
    });

    notificationTarget.addEventListener('change', () => {
        specificIdInput.style.display = notificationTarget.value.includes('specific') ? 'block' : 'none';
    });

    notificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        notificationStatus.textContent = 'Відправка...';
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(SEND_NOTIFICATION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ 
                title: notificationTitle.value, body: notificationMessage.value, 
                recipientType: notificationTarget.value, specificId: specificIdInput.value 
            })
        });
        notificationStatus.textContent = 'Надіслано!';
        notificationForm.reset();
    });

    faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const obj = { question_uk: faqQuestionUkInput.value, answer_uk: faqAnswerUkInput.value, question_en: faqQuestionEnInput.value, answer_en: faqAnswerEnInput.value };
        if (faqIdInput.value) await supabase.from('faqs').update(obj).eq('id', faqIdInput.value);
        else await supabase.from('faqs').insert([obj]);
        faqForm.reset(); faqIdInput.value = ''; fetchFaqsAdmin();
    });

    faqList.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('delete-btn')) {
            if (confirm('Видалити?')) { await supabase.from('faqs').delete().eq('id', id); fetchFaqsAdmin(); }
        } else if (btn.classList.contains('edit-btn')) {
            const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
            faqIdInput.value = data.id; faqQuestionUkInput.value = data.question_uk; faqAnswerUkInput.value = data.answer_uk;
            faqQuestionEnInput.value = data.question_en; faqAnswerEnInput.value = data.answer_en;
        }
    });

    reviewsListAdmin.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn') && confirm('Видалити?')) {
            await supabase.from('app_reviews').delete().eq('id', e.target.dataset.id);
            fetchReviewsAdmin();
        }
    });

    userHelpList.addEventListener('click', (e) => {
        const btn = e.target.closest('.reply-btn');
        if (btn) {
            currentHelpRequestId = btn.dataset.id;
            replyUserEmailDisplay.value = btn.dataset.email;
            originalUserMessageDisplay.value = btn.dataset.msg;
            currentReplyStatusSpan.textContent = btn.dataset.res === 'true' ? 'Вирішено' : 'В процесі';
            replyModal.style.display = 'block';
        }
    });

    toggleResolvedButton.addEventListener('click', async () => {
        const newStatus = currentReplyStatusSpan.textContent === 'В процесі';
        await supabase.from('user_help').update({ is_resolved: newStatus }).eq('id', currentHelpRequestId);
        replyModal.style.display = 'none';
        fetchUserHelp();
    });

    // Кнопки дій лікаря
    saveDoctorProfileButton.addEventListener('click', async () => {
        doctorProfileStatus.textContent = 'Збереження...';
        const parseArray = (val) => { try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()); } };
        const updateData = {
            full_name: inputFullName.value, phone: inputPhone.value, country: inputCountry.value,
            communication_languages: parseArray(inputLanguages.value), specialization: parseArray(inputSpecialization.value),
            experience_years: parseFloat(inputExperience.value)||0, education: inputEducation.value,
            achievements: inputAchievements.value, about_me: inputAboutMe.value,
            consultation_cost: parseFloat(inputConsultationCost.value)||0, consultation_cost_range: inputConsultationCostRange.value,
            search_tags: parseArray(inputSearchTags.value), bank_details: inputBankDetails.value,
            display_order: parseInt(inputDisplayOrder.value)||null
        };
        const { error } = await supabase.from('anketa_doctor').update(updateData).eq('user_id', currentDoctorId);
        doctorProfileStatus.textContent = error ? ('Помилка: ' + error.message) : 'Збережено!';
        if(!error) { doctorProfileStatus.style.color = 'green'; fetchDoctors(); }
    });

    approveDoctorButton.addEventListener('click', async () => {
        if (confirm('Схвалити?')) {
            await supabase.from('anketa_doctor').update({ doctor_check: true, rejection_reason: null }).eq('user_id', currentDoctorId);
            doctorDetailsModal.style.display = 'none'; fetchDoctors(); fetchNewDoctorApplications();
        }
    });

    rejectDoctorButton.addEventListener('click', () => rejectionReasonGroup.style.display = 'block');

    sendRejectionButton.addEventListener('click', async () => {
        if (!rejectionReasonInput.value) return alert('Вкажіть причину');
        await supabase.from('anketa_doctor').update({ doctor_check: false, rejection_reason: rejectionReasonInput.value }).eq('user_id', currentDoctorId);
        doctorDetailsModal.style.display = 'none'; fetchNewDoctorApplications();
    });

    revokeDoctorAccessButton.addEventListener('click', async () => {
        if (confirm('Забрати доступ?')) {
            await supabase.from('anketa_doctor').update({ doctor_check: false }).eq('user_id', currentDoctorId);
            doctorDetailsModal.style.display = 'none'; fetchDoctors();
        }
    });

    deleteDoctorProfileButton.addEventListener('click', async () => {
        if (!confirm('УВАГА! Це видалить акаунт. Продовжити?')) return;
        const { error: dbError } = await supabase.from('anketa_doctor').delete().eq('user_id', currentDoctorId);
        if (dbError) return alert(dbError.message);
        
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(DELETE_AUTH_USER_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ user_id: currentDoctorId })
        });
        doctorDetailsModal.style.display = 'none'; fetchDoctors(); fetchNewDoctorApplications();
    });

    document.querySelectorAll('.close-button').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none'));
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; });

    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    // START
    checkAdminStatus();
    showSection('patients');
});