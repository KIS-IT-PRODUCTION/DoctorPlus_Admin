document.addEventListener('DOMContentLoaded', async () => {
    // --- Ініціалізація Supabase клієнта ---
    // ЗАМІНІТЬ ЦІ ЗНАЧЕННЯ НА ВАШІ РЕАЛЬНІ SUPABASE URL ТА ANON KEY
    const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });

    // --- ДОДАНО: ТИМЧАСОВИЙ АДМІН-КЛЮЧ ДЛЯ АВТЕНТИФІКАЦІЇ В EDGE FUNCTION ---
    // !!! УВАГА: Зберігання секретного ключа в клієнтському JavaScript є НЕБЕЗПЕЧНИМ !!!
    // Це рішення є ТИМЧАСОВИМ для налагодження.
    // У продакшн-середовищі, автентифікація Edge Function повинна відбуватися
    // через JWT-токен користувача (якщо це автентифікований адмін),
    // або через бекенд-сервіс, який безпечно зберігає та використовує API-ключі.
    // --- КІНЕЦЬ ДОДАНОГО БЛОКУ ---

    // --- КОНФІГУРАЦІЯ ДЛЯ EDGE FUNCTION ---
    // Це URL вашої Edge Function для відправки сповіщень
    const EDGE_FUNCTION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/send-admin-notification';

    const DELETE_AUTH_USER_FUNCTION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/delete-auth-user'; // ЗАМІНІТЬ НА РЕАЛЬНИЙ URL ВАШОЇ EDGE FUNCTION

    // --- DOM елементи (перевірені наявність у кінці файлу) ---
    const adminNameSpan = document.getElementById('adminName');
    const adminCreationDateSpan = document.getElementById('adminCreationDate');
    const logoutButton = document.getElementById('logoutButton');

    const showPatientsButton = document.getElementById('showPatients');
    const showDoctorsButton = document.getElementById('showDoctors');
    const showVerifiedDoctorsButton = document.getElementById('showVerifiedDoctors');
    const showNewDoctorApplicationsButton = document.getElementById('showNewDoctorApplications');
    const showNotificationsButton = document.getElementById('showNotifications');

    const patientsSection = document.getElementById('patientsSection');
    const doctorsSection = document.getElementById('doctorsSection');
    const verifiedDoctorsSection = document.getElementById('verifiedDoctorsSection');
    const newDoctorApplicationsSection = document.getElementById('newDoctorApplicationsSection');
    const notificationsSection = document.getElementById('notificationsSection');

    const patientsList = document.getElementById('patientsList');
    const doctorsList = document.getElementById('doctorsList');
    const verifiedDoctorsList = document.getElementById('verifiedDoctorsList');
    const newDoctorApplicationsList = document.getElementById('newDoctorApplicationsList');
    const newApplicationsCountSpan = document.getElementById('newApplicationsCount');

    const notificationForm = document.getElementById('notificationForm');
    const notificationTarget = document.getElementById('notificationTarget');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationStatus = document.getElementById('notificationStatus');
    const specificIdInput = document.getElementById('specificId');
    const extraDataInput = document.getElementById('extraData');

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

    // --- Важлива перевірка наявності всіх елементів DOM ---
    if (!adminNameSpan || !adminCreationDateSpan || !logoutButton || !showPatientsButton || !showDoctorsButton || !showVerifiedDoctorsButton || !showNewDoctorApplicationsButton || !showNotificationsButton ||
        !patientsSection || !doctorsSection || !verifiedDoctorsSection || !newDoctorApplicationsSection || !notificationsSection ||
        !patientsList || !doctorsList || !verifiedDoctorsList || !newDoctorApplicationsList || !newApplicationsCountSpan ||
        !notificationForm || !notificationTarget || !notificationTitle || !notificationMessage || !notificationStatus ||
        !specificIdInput || !extraDataInput ||
        !doctorDetailsModal || !closeButton || !doctorAvatar || !inputFullName || !inputEmail || !inputPhone || !inputCountry ||
        !inputLanguages || !inputSpecialization || !inputExperience || !inputEducation || !inputAchievements || !inputAboutMe ||
        !inputConsultationCost || !inputConsultationCostRange || !inputSearchTags || !inputBankDetails || !detailCertificate ||
        !detailDiploma || !displayDoctorCheck ||
        !approveDoctorButton || !rejectDoctorButton || !saveDoctorProfileButton || !revokeDoctorAccessButton || !deleteDoctorProfileButton || !rejectionReasonGroup || !rejectionReasonInput || !sendRejectionButton || !rejectionStatus || !doctorProfileStatus) {
        console.error('ПОМИЛКА: Один або кілька необхідних елементів DOM не знайдено в admin-dashboard.html. Перевірте ID в HTML та JS.');
        alert('Помилка завантаження адмін-панелі. Відсутні елементи інтерфейсу. Перевірте консоль.');
        return;
    }

    // --- Функція для перевірки аутентифікації та прав адміністратора ---
    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('checkAdminStatus: Користувач не аутентифікований, перенаправлення на вхід.');
            window.location.href = '/index.html';
            return;
        }
        console.log('checkAdminStatus: Увійшов user ID:', user.id);

        const { data: adminProfile, error } = await supabase
            .from('profiles_admin')
            .select('user_id, full_name, created_at')
            .eq('user_id', user.id)
            .single();

        if (error || !adminProfile) {
            console.error('checkAdminStatus: Доступ заборонено!');
            console.error('Помилка Supabase (якщо є):', error);
            console.log('Отриманий adminProfile:', adminProfile);
            alert('У вас немає прав доступу до цієї панелі. Перевірте консоль для деталей.');

            await supabase.auth.signOut();
            window.location.href = '/index.html';
        } else {
            console.log('checkAdminStatus: Адмін увійшов. Доступ дозволено.');
            adminNameSpan.textContent = adminProfile.full_name || user.email || 'Адміністратор';
            if (adminProfile.created_at) {
                const date = new Date(adminProfile.created_at);
                adminCreationDateSpan.textContent = `(Профіль створено: ${date.toLocaleDateString()})`;
            } else {
                adminCreationDateSpan.textContent = '';
            }

            showSection('patients');
            fetchPatients();
            fetchNewDoctorApplicationsCount();
        }
    };

    // --- Функція для перемикання видимості секцій ---
    const showSection = (sectionId) => {
        patientsSection.style.display = 'none';
        doctorsSection.style.display = 'none';
        verifiedDoctorsSection.style.display = 'none';
        newDoctorApplicationsSection.style.display = 'none';
        notificationsSection.style.display = 'none';

        document.getElementById(sectionId + 'Section').style.display = 'block';

        showPatientsButton.classList.remove('active');
        showDoctorsButton.classList.remove('active');
        showVerifiedDoctorsButton.classList.remove('active');
        showNewDoctorApplicationsButton.classList.remove('active');
        showNotificationsButton.classList.remove('active');

        if (sectionId === 'patients') showPatientsButton.classList.add('active');
        else if (sectionId === 'doctors') showDoctorsButton.classList.add('active');
        else if (sectionId === 'verifiedDoctors') showVerifiedDoctorsButton.classList.add('active');
        else if (sectionId === 'newDoctorApplications') showNewDoctorApplicationsButton.classList.add('active');
        else if (sectionId === 'notifications') showNotificationsButton.classList.add('active');
    };

    // --- Функції для завантаження та відображення даних ---

    const fetchPatients = async () => {
        patientsList.innerHTML = '<li>Завантаження пацієнтів...</li>';
        const { data, error } = await supabase.from('profiles').select('*');

        if (error) {
            console.error('Помилка завантаження пацієнтів:', error.message);
            patientsList.innerHTML = `<li>Помилка завантаження пацієнтів: ${error.message}</li>`;
            return;
        }

        if (data.length === 0) {
            patientsList.innerHTML = '<li>Немає пацієнтів.</li>';
            return;
        }

        patientsList.innerHTML = '';
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
            console.error('Помилка завантаження лікарів:', error.message);
            doctorsList.innerHTML = `<li>Помилка завантаження лікарів: ${error.message}</li>`;
            return;
        }

        if (data.length === 0) {
            doctorsList.innerHTML = '<li>Немає лікарів.</li>';
            return;
        }

        doctorsList.innerHTML = '';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.dataset.doctorId = profile.user_id;

            li.innerHTML = `
                <strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'})
                - Перевірений: ${profile.doctor_check ? 'Так' : 'Ні'}
            `;
            doctorsList.appendChild(li);
        });

        doctorsList.querySelectorAll('.doctor-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const doctorId = e.currentTarget.dataset.doctorId;
                if (doctorId) {
                    await showDoctorDetails(doctorId);
                }
            });
        });
    };

    const fetchVerifiedDoctors = async () => {
        verifiedDoctorsList.innerHTML = '<li>Завантаження перевірених лікарів...</li>';
        const { data, error } = await supabase
            .from('anketa_doctor')
            .select('*')
            .eq('doctor_check', true);

        if (error) {
            console.error('Помилка завантаження перевірених лікарів:', error.message);
            verifiedDoctorsList.innerHTML = `<li>Помилка завантаження: ${error.message}</li>`;
            return;
        }

        if (data.length === 0) {
            verifiedDoctorsList.innerHTML = '<li>Немає перевірених лікарів.</li>';
            return;
        }

        verifiedDoctorsList.innerHTML = '';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'})`;
            verifiedDoctorsList.appendChild(li);
        });
    };

    const fetchNewDoctorApplications = async () => {
        newDoctorApplicationsList.innerHTML = '<li>Завантаження нових заявок...</li>';
        const { data, error } = await supabase
            .from('anketa_doctor')
            .select('*')
            .eq('doctor_check', false);

        if (error) {
            console.error('Помилка завантаження нових заявок:', error.message);
            newDoctorApplicationsList.innerHTML = `<li>Помилка завантаження: ${error.message}</li>`;
            newApplicationsCountSpan.textContent = 'X';
            return;
        }

        newApplicationsCountSpan.textContent = data.length;

        if (data.length === 0) {
            newDoctorApplicationsList.innerHTML = '<li>Немає нових заявок.</li>';
            return;
        }

        newDoctorApplicationsList.innerHTML = '';
        data.forEach(profile => {
            const li = document.createElement('li');
            li.classList.add('doctor-item');
            li.dataset.doctorId = profile.user_id;

            li.innerHTML = `
                <strong>${profile.full_name || 'N/A'}</strong> (${profile.email || 'N/A'})
                <span style="color: red; margin-left: 10px;" title="Неприйнята заявка">❌</span>
            `;
            newDoctorApplicationsList.appendChild(li);
        });

        newDoctorApplicationsList.querySelectorAll('.doctor-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const doctorId = e.currentTarget.dataset.doctorId;
                if (doctorId) {
                    await showDoctorDetails(doctorId);
                }
            });
        });
    };

    const fetchNewDoctorApplicationsCount = async () => {
        const { count, error } = await supabase
            .from('anketa_doctor')
            .select('*', { count: 'exact', head: true })
            .eq('doctor_check', false);

        if (error) {
            console.error('Помилка завантаження кількості нових заявок:', error.message);
            newApplicationsCountSpan.textContent = 'X';
            return;
        }
        newApplicationsCountSpan.textContent = count;
        if (count === 0) {
            newApplicationsCountSpan.style.display = 'none';
        } else {
            newApplicationsCountSpan.style.display = 'inline-block';
        }
    };

    // --- Функція для показу деталей лікаря у модальному вікні (з можливістю редагування) ---
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

        const { data, error } = await supabase
            .from('anketa_doctor')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            console.error('Помилка завантаження деталей лікаря:', error ? error.message : 'Дані не знайдено');
            alert('Не вдалося завантажити деталі лікаря.');
            doctorDetailsModal.style.display = 'none';
            return;
        }

        console.log('Отримані деталі лікаря:', data);

        doctorAvatar.src = data.avatar_url || 'https://via.placeholder.com/150';
        doctorAvatar.alt = data.full_name || 'Аватар лікаря';
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

        detailCertificate.href = data.certificate_photo_url ? data.certificate_photo_url : '#';
        detailCertificate.textContent = data.certificate_photo_url ? 'Переглянути сертифікат' : 'Немає';
        detailCertificate.style.pointerEvents = data.certificate_photo_url ? 'auto' : 'none';

        detailDiploma.href = data.diploma_url ? data.diploma_url : '#';
        detailDiploma.textContent = data.diploma_url ? 'Переглянути диплом' : 'Немає';
        detailDiploma.style.pointerEvents = data.diploma_url ? 'auto' : 'none';

        displayDoctorCheck.textContent = data.doctor_check ? 'Так' : 'Ні';

        if (!data.doctor_check) {
            approveDoctorButton.style.display = 'inline-block';
            rejectDoctorButton.style.display = 'inline-block';
        }

        doctorDetailsModal.style.display = 'block';
    };

    // --- Функція для відправки сповіщення через Edge Function ---
    // **ВАЖЛИВО:** Ця функція використовує `ADMIN_SECRET_KEY` у заголовку.
    // Якщо ваша Edge Function очікує JWT (що є краще), то замість 'X-Admin-Secret'
    // потрібно передавати `Authorization: Bearer <JWT_токен_адміна>`
   const sendNotification = async (payload) => {
    notificationStatus.textContent = 'Відправлення сповіщення...';
    notificationStatus.style.color = '#FFA500';

    try {
        // Отримуємо поточну сесію користувача
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.access_token) {
            // Якщо адмін не авторизований або немає токена
            notificationStatus.textContent = 'Помилка: Користувач не аутентифікований для відправки сповіщень.';
            notificationStatus.style.color = '#d32f2f';
            console.error('Помилка отримання сесії:', sessionError || 'Сесія відсутня');
            return { success: false, message: 'Користувач не аутентифікований.' }; // Повертаємо об'єкт результату
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ПЕРЕДАЄМО JWT Access Token АДМІНА У ЗАГОЛОВКУ AUTHORIZATION
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Помилка Edge Function Response (sendNotification):', errorData);
            throw new Error(`HTTP Error! Status: ${response.status}, Details: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('Успішна відповідь від Edge Function (sendNotification):', result);
        notificationStatus.textContent = `Сповіщення успішно відправлено ${result.count} отримувачам!`;
        notificationStatus.style.color = '#4CAF50';
        notificationForm.reset();
        specificIdInput.value = '';
        extraDataInput.value = '';
        if (notificationTarget.value !== 'specific_doctor' && notificationTarget.value !== 'specific_patient') {
            specificIdInput.style.display = 'none';
        }
        return { success: true, message: 'Сповіщення успішно відправлено!' }; // Повертаємо об'єкт результату

    } catch (error) {
        console.error('Помилка відправки сповіщення через Edge Function:', error);
        notificationStatus.textContent = 'Помилка відправки сповіщення: ' + error.message;
        notificationStatus.style.color = '#d32f2f';
        return { success: false, message: error.message }; // Повертаємо об'єкт результату
    }
};


    // --- Обробники подій для кнопок дій лікаря у модальному вікні ---

    approveDoctorButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;

        rejectionReasonGroup.style.display = 'none';
        rejectionReasonInput.value = '';
        rejectionStatus.textContent = '';

        const confirmApprove = confirm('Ви впевнені, що хочете схвалити цього лікаря?');
        if (!confirmApprove) return;

        doctorProfileStatus.textContent = 'Оновлення статусу...';
        doctorProfileStatus.style.color = '#FFA500';

        const { error: updateError } = await supabase
            .from('anketa_doctor')
            .update({ doctor_check: true, rejection_reason: null }) // Оновлено: очищаємо причину відхилення при схваленні
            .eq('user_id', currentDoctorId);

        if (updateError) {
            doctorProfileStatus.textContent = 'Помилка при схваленні лікаря: ' + updateError.message;
            doctorProfileStatus.style.color = '#d32f2f';
            console.error('Помилка при схваленні лікаря:', updateError);
        } else {
            doctorProfileStatus.textContent = 'Лікаря успішно схвалено!';
            doctorProfileStatus.style.color = '#4CAF50';

            // Відправка сповіщення про схвалення
            const notificationPayload = {
                title: 'Ваш профіль лікаря схвалено!',
                body: 'Вітаємо! Ваш профіль лікаря успішно пройшов перевірку та був схвалений адміністратором. Тепер ви доступні для консультацій.',
                recipientType: 'specific_doctor',
                specificId: currentDoctorId,
                data: { status: 'approved' }
            };
            const notificationResult = await sendNotification(notificationPayload);

            if (notificationResult.success) {
                console.log('Сповіщення про схвалення успішно відправлено.');
            } else {
                console.error('Помилка відправки сповіщення про схвалення:', notificationResult.message);
                doctorProfileStatus.textContent += ' Помилка сповіщення: ' + notificationResult.message;
                doctorProfileStatus.style.color = '#d32f2f';
            }

            displayDoctorCheck.textContent = 'Так';
            approveDoctorButton.style.display = 'none';
            rejectDoctorButton.style.display = 'none';

            fetchNewDoctorApplications();
            fetchDoctors();
            fetchVerifiedDoctors();
            fetchNewDoctorApplicationsCount();
        }
    });

    rejectDoctorButton.addEventListener('click', () => {
        if (!currentDoctorId) return;
        rejectionReasonGroup.style.display = 'block';
        rejectionStatus.textContent = '';
        rejectionReasonInput.focus();
        doctorProfileStatus.textContent = '';
    });

    sendRejectionButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;

        const reason = rejectionReasonInput.value.trim();
        if (!reason) {
            rejectionStatus.textContent = 'Будь ласка, введіть причину відхилення.';
            rejectionStatus.style.color = '#d32f2f';
            return;
        }

        rejectionStatus.textContent = 'Відправлення відхилення...';
        rejectionStatus.style.color = '#FFA500';
        doctorProfileStatus.textContent = '';

        const confirmReject = confirm(`Ви впевнені, що хочете відхилити цього лікаря з причиною:\n\n"${reason}"?`);
        if (!confirmReject) {
            rejectionStatus.textContent = '';
            return;
        }

        const { error: updateError } = await supabase
            .from('anketa_doctor')
            .update({ doctor_check: false, rejection_reason: reason })
            .eq('user_id', currentDoctorId);

        if (updateError) {
            rejectionStatus.textContent = 'Помилка оновлення статусу в БД: ' + updateError.message;
            rejectionStatus.style.color = '#d32f2f';
            console.error('Помилка оновлення статусу в БД:', updateError);
            return;
        }

        // Відправка сповіщення про відхилення
        const notificationPayload = {
            title: 'Ваш профіль лікаря відхилено',
            body: `На жаль, ваш профіль лікаря був відхилений адміністратором. Причина: ${reason}`,
            recipientType: 'specific_doctor',
            specificId: currentDoctorId,
            data: { status: 'rejected', reason: reason }
        };
        const notificationResult = await sendNotification(notificationPayload);


        if (notificationResult.success) {
            rejectionStatus.textContent = 'Сповіщення про відхилення успішно відправлено.';
            rejectionStatus.style.color = '#4CAF50';
            alert('Лікаря відхилено. Сповіщення надіслано!');
            doctorDetailsModal.style.display = 'none';
            fetchNewDoctorApplications();
            fetchDoctors();
            fetchVerifiedDoctors();
            fetchNewDoctorApplicationsCount();
        } else {
            rejectionStatus.textContent = 'Помилка при відправці відхилення: ' + notificationResult.message;
            rejectionStatus.style.color = '#d32f2f';
            alert('Помилка при відправці відхилення: ' + notificationResult.message);
        }
    });

    saveDoctorProfileButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;

        doctorProfileStatus.textContent = 'Збереження змін...';
        doctorProfileStatus.style.color = '#FFA500';

        let languagesArray, specializationArray, searchTagsArray;

        try {
            languagesArray = inputLanguages.value.trim() ? JSON.parse(inputLanguages.value.trim()) : null;
            if (languagesArray && !Array.isArray(languagesArray)) throw new Error('Мови спілкування: очікується JSON-масив.');
        } catch (e) {
            doctorProfileStatus.textContent = 'Помилка: Неправильний формат JSON для Мов спілкування. ' + e.message;
            doctorProfileStatus.style.color = '#d32f2f';
            return;
        }

        try {
            specializationArray = inputSpecialization.value.trim() ? JSON.parse(inputSpecialization.value.trim()) : null;
            if (specializationArray && !Array.isArray(specializationArray)) throw new Error('Спеціалізація: очікується JSON-масив.');
        } catch (e) {
            doctorProfileStatus.textContent = 'Помилка: Неправильний формат JSON для Спеціалізації. ' + e.message;
            doctorProfileStatus.style.color = '#d32f2f';
            return;
        }

        try {
            searchTagsArray = inputSearchTags.value.trim() ? JSON.parse(inputSearchTags.value.trim()) : null;
            if (searchTagsArray && !Array.isArray(searchTagsArray)) throw new Error('Теги пошуку: очікується JSON-масив.');
        } catch (e) {
            doctorProfileStatus.textContent = 'Помилка: Неправильний формат JSON для Тегів пошуку. ' + e.message;
            doctorProfileStatus.style.color = '#d32f2f';
            return;
        }

        const updatedData = {
            full_name: inputFullName.value.trim(),
            email: inputEmail.value.trim(),
            phone: inputPhone.value.trim(),
            country: inputCountry.value.trim(),
            communication_languages: languagesArray,
            specialization: specializationArray,
            experience_years: parseFloat(inputExperience.value) || null,
            education: inputEducation.value.trim(),
            achievements: inputAchievements.value.trim(),
            about_me: inputAboutMe.value.trim(),
            consultation_cost: parseFloat(inputConsultationCost.value) || null,
            consultation_cost_range: inputConsultationCostRange.value.trim(),
            search_tags: searchTagsArray,
            bank_details: inputBankDetails.value.trim()
        };

        if (updatedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)) {
            doctorProfileStatus.textContent = 'Помилка: Невірний формат Email.';
            doctorProfileStatus.style.color = '#d32f2f';
            return;
        }

        const { error: updateError } = await supabase
            .from('anketa_doctor')
            .update(updatedData)
            .eq('user_id', currentDoctorId);

        if (updateError) {
            doctorProfileStatus.textContent = 'Помилка при збереженні: ' + updateError.message;
            doctorProfileStatus.style.color = '#d32f2f';
            console.error('Помилка при збереженні профілю лікаря:', updateError);
        } else {
            doctorProfileStatus.textContent = 'Профіль успішно оновлено!';
            doctorProfileStatus.style.color = '#4CAF50';
            fetchDoctors();
            fetchVerifiedDoctors();
            fetchNewDoctorApplications();
            fetchNewDoctorApplicationsCount();
        }
    });

    revokeDoctorAccessButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;

        const confirmRevoke = confirm('Ви впевнені, що хочете зняти доступ цього лікаря (змінити статус перевірки на "Ні")?');
        if (!confirmRevoke) return;

        doctorProfileStatus.textContent = 'Зняття доступу...';
        doctorProfileStatus.style.color = '#FFA500';

        const { error: updateError } = await supabase
            .from('anketa_doctor')
            .update({ doctor_check: false, rejection_reason: 'Доступ призупинено адміністратором.' }) // Оновлено: додаємо причину за замовчуванням
            .eq('user_id', currentDoctorId);

        if (updateError) {
            doctorProfileStatus.textContent = 'Помилка при знятті доступу: ' + updateError.message;
            doctorProfileStatus.style.color = '#d32f2f';
            console.error('Помилка при знятті доступу лікаря:', updateError);
        } else {
            doctorProfileStatus.textContent = 'Доступ лікаря успішно знято!';
            doctorProfileStatus.style.color = '#4CAF50';
            displayDoctorCheck.textContent = 'Ні';
            approveDoctorButton.style.display = 'inline-block';
            rejectDoctorButton.style.display = 'inline-block';

            // Відправка сповіщення про зняття доступу
            const notificationPayload = {
                title: 'Доступ до вашого профілю лікаря призупинено',
                body: 'На жаль, ваш профіль лікаря був тимчасово деактивований адміністратором. Будь ласка, зверніться до підтримки для отримання додаткової інформації.',
                recipientType: 'specific_doctor',
                specificId: currentDoctorId,
                data: { status: 'access_revoked' }
            };
            const notificationResult = await sendNotification(notificationPayload);

            if (notificationResult.success) {
                console.log('Сповіщення про зняття доступу успішно відправлено.');
            } else {
                console.error('Помилка відправки сповіщення про зняття доступу:', notificationResult.message);
                doctorProfileStatus.textContent += ' Помилка сповіщення: ' + notificationResult.message;
                doctorProfileStatus.style.color = '#d32f2f';
            }

            fetchNewDoctorApplications();
            fetchDoctors();
            fetchVerifiedDoctors();
            fetchNewDoctorApplicationsCount();
        }
    });

    deleteDoctorProfileButton.addEventListener('click', async () => {
        if (!currentDoctorId) return;

        const confirmDelete = confirm('Ви впевнені, що хочете остаточно видалити цього лікаря та пов\'язані дані? Цю дію не можна скасувати!');
        if (!confirmDelete) return;

        doctorProfileStatus.textContent = 'Видалення профілю...';
        doctorProfileStatus.style.color = '#FFA500';

        try {
            // Отримання email лікаря для видалення користувача з Supabase Auth
            const { data: doctorProfile, error: profileError } = await supabase
                .from('anketa_doctor')
                .select('email')
                .eq('user_id', currentDoctorId)
                .single();

            if (profileError || !doctorProfile) {
                throw new Error('Не вдалося знайти email лікаря для видалення користувача Auth: ' + (profileError?.message || ''));
            }

            // Видалення запису з таблиці anketa_doctor
            const { error: deleteProfileError } = await supabase
                .from('anketa_doctor')
                .delete()
                .eq('user_id', currentDoctorId);

            if (deleteProfileError) {
                throw new Error('Помилка при видаленні профілю лікаря з БД: ' + deleteProfileError.message);
            }

            // Виклик Edge Function для видалення користувача з Supabase Auth
            const deleteAuthPayload = { userId: currentDoctorId, email: doctorProfile.email };
            const { data: { session } } = await supabase.auth.getSession(); // Отримуємо сесію для авторизації
            if (!session || !session.access_token) {
                throw new Error('Не аутентифіковано для виклику функції видалення користувача.');
            }

            const response = await fetch(DELETE_AUTH_USER_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'X-Admin-Secret': ADMIN_SECRET_KEY // Якщо функція видалення Auth користувача також вимагає цей секрет
                },
                body: JSON.stringify(deleteAuthPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Помилка Edge Function при видаленні користувача Auth: ${errorData.error || 'Невідома помилка'}`);
            }

            console.log('Користувача Supabase Auth успішно видалено.');

            doctorProfileStatus.textContent = 'Профіль лікаря та користувача успішно видалено!';
            doctorProfileStatus.style.color = '#4CAF50';
            alert('Профіль лікаря та користувача успішно видалено.');
            doctorDetailsModal.style.display = 'none';

            fetchNewDoctorApplications();
            fetchDoctors();
            fetchVerifiedDoctors();
            fetchNewDoctorApplicationsCount();

        } catch (deleteError) {
            doctorProfileStatus.textContent = 'Помилка видалення: ' + deleteError.message;
            doctorProfileStatus.style.color = '#d32f2f';
            console.error('Помилка видалення лікаря:', deleteError);
        }
    });

    // --- Обробник подій для форми сповіщень ---
    notificationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Запобігти стандартній відправці форми

        const target = notificationTarget.value;
        const title = notificationTitle.value.trim();
        const message = notificationMessage.value.trim();
        let specificId = specificIdInput.value.trim();
        let extraData = {};

        // Валідація
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
                if (typeof extraData !== 'object' || extraData === null) {
                    throw new Error('Додаткові дані повинні бути об\'єктом JSON.');
                }
            }
        } catch (e) {
            notificationStatus.textContent = 'Помилка: Неправильний формат JSON для Додаткових даних. ' + e.message;
            notificationStatus.style.color = '#d32f2f';
            return;
        }

        // Побудова payload для Edge Function
        const payload = {
            title: title,
            body: message,
            recipientType: target,
            data: extraData
        };

        if (target === 'specific_doctor' || target === 'specific_patient') {
            payload.specificId = specificId;
        }

        await sendNotification(payload);
    });

    // --- Обробник зміни типу отримувача для відображення/приховання поля specificId ---
    notificationTarget.addEventListener('change', () => {
        if (notificationTarget.value === 'specific_doctor' || notificationTarget.value === 'specific_patient') {
            specificIdInput.style.display = 'block';
            specificIdInput.setAttribute('placeholder', `Введіть User ID для ${notificationTarget.value === 'specific_doctor' ? 'лікаря' : 'пацієнта'}`);
        } else {
            specificIdInput.style.display = 'none';
            specificIdInput.value = ''; // Очищаємо, якщо поле приховано
        }
    });

    // Ініціалізувати стан поля specificId при завантаженні сторінки
    notificationTarget.dispatchEvent(new Event('change'));

    // --- Інші обробники подій ---
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/index.html';
    });

    closeButton.addEventListener('click', () => {
        doctorDetailsModal.style.display = 'none';
    });

    // Закрити модальне вікно при кліку поза ним
    window.addEventListener('click', (event) => {
        if (event.target === doctorDetailsModal) {
            doctorDetailsModal.style.display = 'none';
        }
    });

    showPatientsButton.addEventListener('click', () => {
        showSection('patients');
        fetchPatients();
    });
    showDoctorsButton.addEventListener('click', () => {
        showSection('doctors');
        fetchDoctors();
    });
    showVerifiedDoctorsButton.addEventListener('click', () => {
        showSection('verifiedDoctors');
        fetchVerifiedDoctors();
    });
    showNewDoctorApplicationsButton.addEventListener('click', () => {
        showSection('newDoctorApplications');
        fetchNewDoctorApplications();
    });
    showNotificationsButton.addEventListener('click', () => {
        showSection('notifications');
    });

    // --- Запуск перевірки статусу адміна при завантаженні сторінки ---
    checkAdminStatus();
});