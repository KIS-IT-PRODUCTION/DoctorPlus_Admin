document.addEventListener('DOMContentLoaded', async () => {

    // --- НАЛАШТУВАННЯ SUPABASE ---
    const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
    const EDGE_FUNCTION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/send-admin-notification';
    const DELETE_AUTH_USER_FUNCTION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/delete-auth-user';

    // --- ОСНОВНІ ЕЛЕМЕНТИ DOM ---
    const adminNameSpan = document.getElementById('adminName');
    const adminCreationDateSpan = document.getElementById('adminCreationDate');
    const logoutButton = document.getElementById('logoutButton');

    // --- КНОПКИ НАВІГАЦІЇ ---
    const navButtons = {
        showPatients: document.getElementById('showPatients'),
        showDoctors: document.getElementById('showDoctors'),
        showNewDoctorApplications: document.getElementById('showNewDoctorApplications'),
        showNotifications: document.getElementById('showNotifications'),
        showFaq: document.getElementById('showFaq'),
        showReviews: document.getElementById('showReviews')
    };

    // --- СЕКЦІЇ КОНТЕНТУ ---
    const sections = {
        patients: document.getElementById('patientsSection'),
        doctors: document.getElementById('doctorsSection'),
        newDoctorApplications: document.getElementById('newDoctorApplicationsSection'),
        notifications: document.getElementById('notificationsSection'),
        faq: document.getElementById('faqSection'),
        reviews: document.getElementById('reviewsSection')
    };

    // --- ЕЛЕМЕНТИ СПИСКІВ ---
    const patientsList = document.getElementById('patientsList');
    const doctorsList = document.getElementById('doctorsList');
    const newDoctorApplicationsList = document.getElementById('newDoctorApplicationsList');
    const newApplicationsCountSpan = document.getElementById('newApplicationsCount');
    const faqList = document.getElementById('faqList');
    const reviewsListAdmin = document.getElementById('reviewsListAdmin');

    // --- ЕЛЕМЕНТИ ФОРМ ---
    const notificationForm = document.getElementById('notificationForm');
    const notificationTarget = document.getElementById('notificationTarget');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationStatus = document.getElementById('notificationStatus');
    const specificIdInput = document.getElementById('specificId');
    const extraDataInput = document.getElementById('extraData');

    const faqForm = document.getElementById('faqForm');
    const faqIdInput = document.getElementById('faqId');
    const faqQuestionUkInput = document.getElementById('faqQuestionUk');
    const faqAnswerUkInput = document.getElementById('faqAnswerUk');
    const faqQuestionEnInput = document.getElementById('faqQuestionEn');
    const faqAnswerEnInput = document.getElementById('faqAnswerEn');
    const clearFaqFormButton = document.getElementById('clearFaqForm');
    const faqStatus = document.getElementById('faqStatus');

    const reviewForm = document.getElementById('reviewForm');
    const reviewIdInput = document.getElementById('reviewId');
    const reviewUserNameInput = document.getElementById('reviewUserName');
    const reviewRatingInput = document.getElementById('reviewRating');
    const reviewDescriptionInput = document.getElementById('reviewDescription');
    const clearReviewFormButton = document.getElementById('clearReviewForm');
    const reviewStatus = document.getElementById('reviewStatus');

    // --- ЕЛЕМЕНТИ МОДАЛЬНОГО ВІКНА ЛІКАРЯ ---
    const doctorDetailsModal = document.getElementById('doctorDetailsModal');
    const closeButton = doctorDetailsModal.querySelector('.close-button');
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
    const detailCertificate = document.getElementById('detailCertificate');
    const detailDiploma = document.getElementById('detailDiploma');
    const displayDoctorCheck = document.getElementById('displayDoctorCheck');
    const approveDoctorButton = document.getElementById('approveDoctorButton');
    const rejectDoctorButton = document.getElementById('rejectDoctorButton');
    const saveDoctorProfileButton = document.getElementById('saveDoctorProfileButton');
    const revokeDoctorAccessButton = document.getElementById('revokeDoctorAccessButton');
    const deleteDoctorProfileButton = document.getElementById('deleteDoctorProfileButton');
    const rejectionReasonGroup = document.getElementById('rejectionReasonGroup');
    const rejectionReasonInput = document.getElementById('rejectionReason');
    const sendRejectionButton = document.getElementById('sendRejectionButton');
    const rejectionStatus = document.getElementById('rejectionStatus');
    const doctorProfileStatus = document.getElementById('doctorProfileStatus');
    let currentDoctorId = null;

    // --- ОСНОВНІ ФУНКЦІЇ ПАНЕЛІ ---

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        const { data: adminProfile, error } = await supabase.from('profiles_admin').select('user_id, full_name, created_at').eq('user_id', user.id).single();
        if (error || !adminProfile) {
            alert('У вас немає прав доступу до цієї панелі.');
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        } else {
            adminNameSpan.textContent = adminProfile.full_name;
            adminCreationDateSpan.textContent = `(Профіль створено: ${new Date(adminProfile.created_at).toLocaleDateString()})`;
            showSection('patients');
            fetchPatients();
            fetchNewDoctorApplicationsCount();
        }
    };

    const showSection = (sectionId) => {
        Object.values(sections).forEach(section => { if(section) section.style.display = 'none'; });
        Object.values(navButtons).forEach(button => { if(button) button.classList.remove('active'); });
        
        if (sections[sectionId]) {
            sections[sectionId].style.display = 'block';
        }
        const buttonKey = 'show' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        if (navButtons[buttonKey]) {
            navButtons[buttonKey].classList.add('active');
        }
    };

    // --- ФУНКЦІЇ ЗАВАНТАЖЕННЯ ДАНИХ (FETCH) ---

    const fetchPatients = async () => {
        patientsList.innerHTML = '<li>Завантаження пацієнтів...</li>';
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            patientsList.innerHTML = `<li>Помилка завантаження: ${error.message}</li>`;
            return;
        }
        patientsList.innerHTML = data.length > 0 ? '' : '<li>Немає пацієнтів.</li>';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'})`;
            patientsList.appendChild(li);
        });
    };

    const fetchDoctors = async () => {
        doctorsList.innerHTML = '<li>Завантаження лікарів...</li>';
        const { data, error } = await supabase.from('anketa_doctor').select('*');
        if (error) {
            doctorsList.innerHTML = `<li>Помилка завантаження: ${error.message}</li>`;
            return;
        }
        doctorsList.innerHTML = data.length > 0 ? '' : '<li>Немає лікарів.</li>';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.dataset.doctorId = profile.user_id;
            li.innerHTML = `<strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'}) - Перевірений: ${profile.doctor_check ? 'Так' : 'Ні'}`;
            li.addEventListener('click', () => showDoctorDetails(profile.user_id));
            doctorsList.appendChild(li);
        });
    };
    
    const fetchNewDoctorApplications = async () => {
        newDoctorApplicationsList.innerHTML = '<li>Завантаження нових заявок...</li>';
        const { data, error } = await supabase.from('anketa_doctor').select('*').eq('doctor_check', false);
        if (error) {
            newDoctorApplicationsList.innerHTML = `<li>Помилка завантаження: ${error.message}</li>`;
            return;
        }
        newDoctorApplicationsList.innerHTML = data.length > 0 ? '' : '<li>Немає нових заявок.</li>';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.dataset.doctorId = profile.user_id;
            li.innerHTML = `<strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'})`;
            li.addEventListener('click', () => showDoctorDetails(profile.user_id));
            newDoctorApplicationsList.appendChild(li);
        });
    };

    const fetchNewDoctorApplicationsCount = async () => {
        const { count, error } = await supabase.from('anketa_doctor').select('*', { count: 'exact', head: true }).eq('doctor_check', false);
        newApplicationsCountSpan.textContent = error ? 'X' : count;
        newApplicationsCountSpan.style.display = count > 0 ? 'inline-block' : 'none';
    };

    const fetchFaqsAdmin = async () => {
        faqList.innerHTML = '<tr><td colspan="3">Завантаження...</td></tr>';
        const { data, error } = await supabase.from('faqs').select('*').order('id');
        if (error) {
            faqList.innerHTML = `<tr><td colspan="3" style="color: red;">Помилка: ${error.message}</td></tr>`;
            return;
        }
        faqList.innerHTML = data.length > 0 ? '' : '<tr><td colspan="3">Жодного запису FAQ не знайдено.</td></tr>';
        data.forEach(faq => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${faq.id}</td>
                <td>${faq.question_uk}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${faq.id}">Редагувати</button>
                    <button class="delete-btn" data-id="${faq.id}">Видалити</button>
                </td>
            `;
            faqList.appendChild(row);
        });
    };

    const fetchReviewsAdmin = async () => {
        reviewsListAdmin.innerHTML = '<tr><td colspan="5">Завантаження відгуків...</td></tr>';
        const { data, error } = await supabase.from('app_reviews').select('*').order('created_at', { ascending: false });
        if (error) {
            reviewsListAdmin.innerHTML = `<tr><td colspan="5" style="color: red;">Помилка: ${error.message}</td></tr>`;
            return;
        }
        reviewsListAdmin.innerHTML = data.length > 0 ? '' : '<tr><td colspan="5">Відгуків не знайдено.</td></tr>';
        data.forEach(review => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${review.id}</td>
                <td>${review.user_name}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${review.description.substring(0, 50)}...</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${review.id}">Редагувати</button>
                    <button class="delete-btn" data-id="${review.id}">Видалити</button>
                </td>
            `;
            reviewsListAdmin.appendChild(row);
        });
    };

    // --- ІНШІ ДОПОМІЖНІ ФУНКЦІЇ ---

    const showDoctorDetails = async (userId) => {
        currentDoctorId = userId;
        rejectionReasonGroup.style.display = 'none';
        rejectionReasonInput.value = '';
        rejectionStatus.textContent = '';
        doctorProfileStatus.textContent = '';

        approveDoctorButton.style.display = 'none';
        rejectDoctorButton.style.display = 'none';
        saveDoctorProfileButton.style.display = 'inline-block';
        revokeDoctorAccessButton.style.display = 'inline-block';
        deleteDoctorProfileButton.style.display = 'inline-block';

        const { data, error } = await supabase.from('anketa_doctor').select('*').eq('user_id', userId).single();

        if (error || !data) {
            alert('Не вдалося завантажити деталі лікаря.');
            doctorDetailsModal.style.display = 'none';
            return;
        }

        doctorAvatar.src = data.avatar_url || 'https://via.placeholder.com/150';
        inputFullName.value = data.full_name || '';
        inputEmail.value = data.email || '';
        inputPhone.value = data.phone || '';
        inputCountry.value = data.country || '';
        inputLanguages.value = Array.isArray(data.communication_languages) ? JSON.stringify(data.communication_languages) : (data.communication_languages || '');
        inputSpecialization.value = Array.isArray(data.specialization) ? JSON.stringify(data.specialization) : (data.specialization || '');
        inputExperience.value = data.experience_years || '';
        inputEducation.value = data.education || '';
        inputAchievements.value = data.achievements || '';
        inputAboutMe.value = data.about_me || '';
        inputConsultationCost.value = data.consultation_cost || '';
        inputConsultationCostRange.value = data.consultation_cost_range || '';
        inputSearchTags.value = Array.isArray(data.search_tags) ? JSON.stringify(data.search_tags) : (data.search_tags || '');
        inputBankDetails.value = data.bank_details || '';

        detailCertificate.href = data.certificate_photo_url || '#';
        detailCertificate.textContent = data.certificate_photo_url ? 'Переглянути сертифікат' : 'Немає';
        detailCertificate.style.pointerEvents = data.certificate_photo_url ? 'auto' : 'none';

        detailDiploma.href = data.diploma_url || '#';
        detailDiploma.textContent = data.diploma_url ? 'Переглянути диплом' : 'Немає';
        detailDiploma.style.pointerEvents = data.diploma_url ? 'auto' : 'none';

        displayDoctorCheck.textContent = data.doctor_check ? 'Так' : 'Ні';

        if (!data.doctor_check) {
            approveDoctorButton.style.display = 'inline-block';
            rejectDoctorButton.style.display = 'inline-block';
        }

        doctorDetailsModal.style.display = 'block';
    };

    const sendNotification = async (payload) => {
        notificationStatus.textContent = 'Відправлення сповіщення...';
        notificationStatus.style.color = '#FFA500';

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Користувач не аутентифікований.');
            }
            const response = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorData.error || 'Unknown error'}`);
            }
            const result = await response.json();
            notificationStatus.textContent = `Сповіщення успішно відправлено ${result.count} отримувачам!`;
            notificationStatus.style.color = '#4CAF50';
            notificationForm.reset();
            specificIdInput.style.display = 'none';
            return { success: true };
        } catch (error) {
            notificationStatus.textContent = 'Помилка відправки: ' + error.message;
            notificationStatus.style.color = '#d32f2f';
            return { success: false, message: error.message };
        }
    };
    
    const clearFaqForm = () => {
        faqForm.reset();
        faqIdInput.value = '';
        faqStatus.textContent = '';
    };

    const clearReviewForm = () => {
        reviewForm.reset();
        reviewIdInput.value = '';
        reviewStatus.textContent = '';
    };

    // --- ОБРОБНИКИ ПОДІЙ ---

    // Навігація
    Object.keys(navButtons).forEach(key => {
        const button = navButtons[key];
        const sectionId = key.replace('show', '').charAt(0).toLowerCase() + key.slice(5);
        if (button) {
            button.addEventListener('click', () => {
                showSection(sectionId);
                switch(sectionId) {
                    case 'patients': fetchPatients(); break;
                    case 'doctors': fetchDoctors(); break;
                    case 'newDoctorApplications': fetchNewDoctorApplications(); break;
                    case 'faq': fetchFaqsAdmin(); break;
                    case 'reviews': fetchReviewsAdmin(); break;
                }
            });
        }
    });

    // Форма сповіщень
    notificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const target = notificationTarget.value;
        const title = notificationTitle.value.trim();
        const message = notificationMessage.value.trim();
        const specificId = specificIdInput.value.trim();
        let extraData = {};

        if (!title || !message) {
            notificationStatus.textContent = 'Будь ласка, заповніть заголовок та повідомлення.';
            notificationStatus.style.color = '#d32f2f';
            return;
        }
        if ((target === 'specific_doctor' || target === 'specific_patient') && !specificId) {
            notificationStatus.textContent = 'Будь ласка, вкажіть ID для конкретного отримувача.';
            notificationStatus.style.color = '#d32f2f';
            return;
        }
        try {
            if (extraDataInput.value.trim()) {
                extraData = JSON.parse(extraDataInput.value.trim());
            }
        } catch (e) {
            notificationStatus.textContent = 'Помилка: Неправильний формат JSON для Додаткових даних.';
            notificationStatus.style.color = '#d32f2f';
            return;
        }
        const payload = { title, body: message, recipientType: target, data: extraData };
        if (specificId) {
            payload.specificId = specificId;
        }
        await sendNotification(payload);
    });

    notificationTarget.addEventListener('change', () => {
        if (notificationTarget.value === 'specific_doctor' || notificationTarget.value === 'specific_patient') {
            specificIdInput.style.display = 'block';
            specificIdInput.placeholder = `Введіть User ID для ${notificationTarget.value === 'specific_doctor' ? 'лікаря' : 'пацієнта'}`;
        } else {
            specificIdInput.style.display = 'none';
        }
    });

    // Керування FAQ
    faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = faqIdInput.value;
        const faqData = {
            question_uk: faqQuestionUkInput.value.trim(),
            answer_uk: faqAnswerUkInput.value.trim(),
            question_en: faqQuestionEnInput.value.trim(),
            answer_en: faqAnswerEnInput.value.trim(),
        };
        if (!faqData.question_uk || !faqData.answer_uk || !faqData.question_en || !faqData.answer_en) {
            faqStatus.textContent = 'Всі поля є обов\'язковими.';
            faqStatus.style.color = 'red';
            return;
        }
        faqStatus.textContent = 'Збереження...';
        const { error } = id ? await supabase.from('faqs').update(faqData).eq('id', id) : await supabase.from('faqs').insert([faqData]);
        if (error) {
            faqStatus.textContent = `Помилка: ${error.message}`;
            faqStatus.style.color = 'red';
        } else {
            faqStatus.textContent = 'Успішно збережено!';
            faqStatus.style.color = 'green';
            clearFaqForm();
            fetchFaqsAdmin();
        }
    });

    faqList.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
            if (data) {
                faqIdInput.value = data.id;
                faqQuestionUkInput.value = data.question_uk;
                faqAnswerUkInput.value = data.answer_uk;
                faqQuestionEnInput.value = data.question_en;
                faqAnswerEnInput.value = data.answer_en;
                sections.faq.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm(`Видалити FAQ з ID: ${id}?`)) {
                const { error } = await supabase.from('faqs').delete().eq('id', id);
                if (error) alert(`Помилка видалення: ${error.message}`);
                else {
                    alert('Запис видалено!');
                    fetchFaqsAdmin();
                }
            }
        }
    });
    clearFaqFormButton.addEventListener('click', clearFaqForm);

reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = reviewIdInput.value;
        const reviewData = {
            user_name: reviewUserNameInput.value.trim(),
            rating: parseInt(reviewRatingInput.value, 10),
            description: reviewDescriptionInput.value.trim(),
        };

        // --- Get the current authenticated user's ID ---
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            reviewStatus.textContent = 'Помилка: Користувач не авторизований. Будь ласка, увійдіть.';
            reviewStatus.style.color = 'red';
            return;
        }

        // Add the user_id to reviewData
        reviewData.user_id = user.id; // <-- Add this line

        if (!reviewData.user_name || !reviewData.description || !reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            reviewStatus.textContent = 'Заповніть поля коректно (рейтинг від 1 до 5).';
            reviewStatus.style.color = 'red';
            return;
        }

        reviewStatus.textContent = 'Збереження...';
        const { error } = id ? await supabase.from('app_reviews').update(reviewData).eq('id', id) : await supabase.from('app_reviews').insert([reviewData]);
        if (error) {
            reviewStatus.textContent = `Помилка: ${error.message}`;
            reviewStatus.style.color = 'red';
        } else {
            reviewStatus.textContent = 'Відгук збережено!';
            reviewStatus.style.color = 'green';
            clearReviewForm();
            fetchReviewsAdmin();
        }
    });

    reviewsListAdmin.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            const { data } = await supabase.from('app_reviews').select('*').eq('id', id).single();
            if (data) {
                reviewIdInput.value = data.id;
                reviewUserNameInput.value = data.user_name;
                reviewRatingInput.value = data.rating;
                reviewDescriptionInput.value = data.description;
                sections.reviews.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm(`Видалити відгук з ID: ${id}?`)) {
                const { error } = await supabase.from('app_reviews').delete().eq('id', id);
                if (error) alert(`Помилка видалення: ${error.message}`);
                else {
                    alert('Відгук видалено!');
                    fetchReviewsAdmin();
                }
            }
        }
    });
    clearReviewFormButton.addEventListener('click', clearReviewForm);

    // Вихід
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    // Модальне вікно
    closeButton.addEventListener('click', () => { doctorDetailsModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === doctorDetailsModal) doctorDetailsModal.style.display = 'none'; });

    // Кнопки в модальному вікні
    approveDoctorButton.addEventListener('click', async () => {
        if (!currentDoctorId || !confirm('Схвалити цього лікаря?')) return;
        doctorProfileStatus.textContent = 'Оновлення...';
        const { error } = await supabase.from('anketa_doctor').update({ doctor_check: true, rejection_reason: null }).eq('user_id', currentDoctorId);
        if (error) {
            doctorProfileStatus.textContent = 'Помилка: ' + error.message;
        } else {
            doctorProfileStatus.textContent = 'Лікаря схвалено!';
            await sendNotification({ title: 'Ваш профіль схвалено!', body: 'Вітаємо! Ваш профіль лікаря пройшов перевірку.', recipientType: 'specific_doctor', specificId: currentDoctorId });
            fetchNewDoctorApplications();
            fetchDoctors();
        }
    });

    rejectDoctorButton.addEventListener('click', () => { rejectionReasonGroup.style.display = 'block'; });

    sendRejectionButton.addEventListener('click', async () => {
        const reason = rejectionReasonInput.value.trim();
        if (!reason || !confirm(`Відхилити з причиною: "${reason}"?`)) return;
        rejectionStatus.textContent = 'Відправлення...';
        const { error } = await supabase.from('anketa_doctor').update({ doctor_check: false, rejection_reason: reason }).eq('user_id', currentDoctorId);
        if (error) {
            rejectionStatus.textContent = 'Помилка: ' + error.message;
        } else {
            await sendNotification({ title: 'Ваш профіль відхилено', body: `Причина: ${reason}`, recipientType: 'specific_doctor', specificId: currentDoctorId });
            alert('Лікаря відхилено.');
            doctorDetailsModal.style.display = 'none';
            fetchNewDoctorApplications();
        }
    });

    saveDoctorProfileButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;
        doctorProfileStatus.textContent = 'Збереження...';
        let languagesArray, specializationArray, searchTagsArray;
        try {
            languagesArray = JSON.parse(inputLanguages.value.trim() || 'null');
            specializationArray = JSON.parse(inputSpecialization.value.trim() || 'null');
            searchTagsArray = JSON.parse(inputSearchTags.value.trim() || 'null');
        } catch (e) {
            doctorProfileStatus.textContent = 'Помилка: Неправильний формат JSON.';
            return;
        }
        const updatedData = {
            full_name: inputFullName.value.trim(), email: inputEmail.value.trim(), phone: inputPhone.value.trim(), country: inputCountry.value.trim(),
            communication_languages: languagesArray, specialization: specializationArray, experience_years: parseFloat(inputExperience.value) || null,
            education: inputEducation.value.trim(), achievements: inputAchievements.value.trim(), about_me: inputAboutMe.value.trim(),
            consultation_cost: parseFloat(inputConsultationCost.value) || null, consultation_cost_range: inputConsultationCostRange.value.trim(),
            search_tags: searchTagsArray, bank_details: inputBankDetails.value.trim()
        };
        const { error } = await supabase.from('anketa_doctor').update(updatedData).eq('user_id', currentDoctorId);
        if (error) {
            doctorProfileStatus.textContent = 'Помилка: ' + error.message;
        } else {
            doctorProfileStatus.textContent = 'Профіль оновлено!';
            fetchDoctors();
        }
    });

    revokeDoctorAccessButton.addEventListener('click', async () => {
        if (!currentDoctorId || !confirm('Зняти доступ цього лікаря?')) return;
        const { error } = await supabase.from('anketa_doctor').update({ doctor_check: false, rejection_reason: 'Доступ призупинено адміністратором.' }).eq('user_id', currentDoctorId);
        if (error) {
            alert('Помилка: ' + error.message);
        } else {
            alert('Доступ знято.');
            doctorDetailsModal.style.display = 'none';
            fetchNewDoctorApplications();
        }
    });

    deleteDoctorProfileButton.addEventListener('click', async () => {
        if (!currentDoctorId || !confirm('ВИДАЛИТИ цього лікаря? Дія незворотня!')) return;
        try {
            const { error: deleteProfileError } = await supabase.from('anketa_doctor').delete().eq('user_id', currentDoctorId);
            if (deleteProfileError) throw deleteProfileError;
            alert('Профіль видалено.');
            doctorDetailsModal.style.display = 'none';
            fetchDoctors();
        } catch (error) {
            alert('Помилка видалення: ' + error.message);
        }
    });

    // --- ПЕРВИННИЙ ЗАПУСК ---
    checkAdminStatus();
});
