// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Ініціалізація Supabase клієнта ---
    const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co'; // Ваш URL проекту Supabase
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y'; // Ваш публічний "Anon Key"

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            // storage: AsyncStorage, // ЦЕЙ РЯДОК МАЄ БУТИ ВИДАЛЕНИЙ ДЛЯ ВЕБ-ВЕРСІЇ!
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });

    // --- Елементи для перемикання секцій ---
    const showLoginButton = document.getElementById('showLogin');
    const showRegisterButton = document.getElementById('showRegister');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    // --- Елементи для входу ---
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // --- Елементи для реєстрації ---
    const registerForm = document.getElementById('registerForm');
    const registerFullNameInput = document.getElementById('registerFullName'); // НОВЕ ПОЛЕ
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
    const registerButton = document.getElementById('registerButton');
    const registerErrorMessage = document.getElementById('registerErrorMessage');

    // --- Важлива перевірка наявності всіх елементів ---
    if (!showLoginButton || !showRegisterButton || !loginSection || !registerSection ||
        !loginForm || !loginEmailInput || !loginPasswordInput || !loginButton || !loginErrorMessage ||
        !registerForm || !registerFullNameInput || !registerEmailInput || !registerPasswordInput || !registerConfirmPasswordInput || !registerButton || !registerErrorMessage) { // ОНОВЛЕНО
        console.error('ПОМИЛКА: Один або кілька необхідних елементів DOM не знайдено. Перевірте ID в HTML та JS.');
        return;
    }

    // --- Функція для перемикання видимості форм ---
    const showSection = (sectionName) => {
        if (sectionName === 'login') {
            loginSection.style.display = 'block';
            registerSection.style.display = 'none';
            showLoginButton.classList.add('active');
            showRegisterButton.classList.remove('active');
            loginErrorMessage.textContent = '';
        } else {
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
            showLoginButton.classList.remove('active');
            showRegisterButton.classList.add('active');
            registerErrorMessage.textContent = '';
        }
    };

    // --- Слухачі подій для кнопок перемикання ---
    showLoginButton.addEventListener('click', () => {
        console.log('Клік на кнопку "Вхід"');
        showSection('login');
    });

    showRegisterButton.addEventListener('click', () => {
        console.log('Клік на кнопку "Реєстрація"');
        showSection('register');
    });

     // --- Логіка входу для адміністраторів ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        loginErrorMessage.textContent = '';
        loginButton.disabled = true;
        loginButton.textContent = 'Вхід...';

        if (email === '' || password === '') {
            loginErrorMessage.textContent = 'Будь ласка, введіть email та пароль.';
            loginButton.disabled = false;
            loginButton.textContent = 'Увійти';
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Помилка входу Supabase (script.js - signInWithPassword):', error.message);
                loginErrorMessage.textContent = error.message || 'Неправильний email або пароль.';
                loginErrorMessage.style.color = '#d32f2f';
            } else if (data.user) {
                console.log('Успішний вхід користувача (script.js):', data.user);

                const { data: adminProfile, error: adminProfileError } = await supabase
                    .from('profiles_admin')
                    .select('user_id')
                    .eq('user_id', data.user.id)
                    .single();

                if (adminProfileError || !adminProfile) {
                    console.warn('Користувач не є адміністратором (профіль не знайдено в profiles_admin).');
                    // *** ЦІ ЛОГИ ДУЖЕ ВАЖЛИВІ ДЛЯ ДІАГНОСТИКИ ***
                    console.error('Помилка Supabase під час перевірки адмін-профілю (script.js):', adminProfileError);
                    console.log('Отриманий adminProfile під час перевірки (script.js):', adminProfile);
                    // Якщо логи все ще зникають дуже швидко, розкоментуйте наступний рядок
                    // debugger; // Це зупинить виконання JS у браузері, дозволяючи вам детально переглянути змінні

                    await supabase.auth.signOut();
                    loginErrorMessage.textContent = 'У вас немає прав доступу до адмін-панелі.';
                    loginErrorMessage.style.color = '#d32f2f';
                } else {
                    console.log('Користувач є адміністратором. Перенаправлення на адмін-панель...');
                    loginErrorMessage.textContent = 'Вхід успішний! Перенаправлення...';
                    loginErrorMessage.style.color = '#4CAF50';
                    setTimeout(() => {
                        window.location.href = '/admin-dashboard.html';
                    }, 500);
                }
            } else {
                loginErrorMessage.textContent = 'Неправильний email або пароль.';
                loginErrorMessage.style.color = '#d32f2f';
            }

        } catch (err) {
            console.error('Невідома помилка під час входу (script.js):', err);
            loginErrorMessage.textContent = 'Виникла невідома помилка. Спробуйте ще раз.';
            loginErrorMessage.style.color = '#d32f2f';
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Увійти';
        }
    });

    // --- Логіка реєстрації НОВОГО АДМІНІСТРАТОРА (автоматичне додавання) ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = registerFullNameInput.value.trim(); // НОВЕ: отримуємо повне ім'я
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();
        const confirmPassword = registerConfirmPasswordInput.value.trim();

        registerErrorMessage.textContent = '';
        registerButton.disabled = true;
        registerButton.textContent = 'Реєстрація...';

        if (fullName === '' || email === '' || password === '' || confirmPassword === '') { // ОНОВЛЕНО
            registerErrorMessage.textContent = 'Будь ласка, заповніть всі поля.';
            registerButton.disabled = false;
            registerButton.textContent = 'Зареєструватися';
            return;
        }

        if (password !== confirmPassword) {
            registerErrorMessage.textContent = 'Паролі не співпадають.';
            registerButton.disabled = false;
            registerButton.textContent = 'Зареєструватися';
            return;
        }

        if (password.length < 6) {
            registerErrorMessage.textContent = 'Пароль повинен містити щонайменше 6 символів.';
            registerButton.disabled = false;
            registerButton.textContent = 'Зареєструватися';
            return;
        }

        try {
            // Крок 1: Реєстрація користувача через Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Помилка реєстрації Supabase (Auth):', error.message);
                registerErrorMessage.textContent = error.message || 'Помилка реєстрації.';
                registerErrorMessage.style.color = '#d32f2f';
            } else if (data.user) {
                console.log('Користувач зареєстрований в auth.users:', data.user);

                // Крок 2: Увійти щойно зареєстрованим користувачем, щоб активувати сесію.
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (signInError) {
                    console.error('Помилка входу після реєстрації:', signInError.message);
                    registerErrorMessage.textContent = `Реєстрація успішна, але не вдалося автоматично увійти: ${signInError.message}`;
                    registerErrorMessage.style.color = '#d32f2f';
                    registerButton.disabled = false;
                    registerButton.textContent = 'Зареєструватися';
                    return;
                }

                // Крок 3: Автоматичне додавання профілю до profiles_admin
                const { error: insertError } = await supabase
                    .from('profiles_admin')
                    .insert({
                        user_id: data.user.id,
                        email: data.user.email,
                        full_name: fullName // ОНОВЛЕНО: використовуємо fullName з поля форми
                    });

                if (insertError) {
                    console.error('Помилка додавання до profiles_admin:', insertError.message);
                    registerErrorMessage.textContent = `Реєстрація успішна, але сталася помилка при наданні прав адміністратора: ${insertError.message}`;
                    registerErrorMessage.style.color = '#d32f2f';
                } else {
                    console.log('Користувача додано до profiles_admin.');
                    registerErrorMessage.textContent = 'Реєстрація успішна! Тепер ви адміністратор і можете увійти.';
                    registerErrorMessage.style.color = '#4CAF50';
                    registerForm.reset();
                    setTimeout(() => {
                        window.location.href = '/admin-dashboard.html';
                    }, 500);
                }
            } else {
                registerErrorMessage.textContent = 'Невідома помилка під час реєстрації.';
                registerErrorMessage.style.color = '#d32f2f';
            }

        } catch (err) {
            console.error('Невідома помилка під час реєстрації:', err);
            registerErrorMessage.textContent = 'Виникла невідома помилка. Спробуйте ще раз.';
            registerErrorMessage.style.color = '#d32f2f';
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Зареєструватися';
        }
    });
});