document.addEventListener('DOMContentLoaded', () => {
    // --- Логіка для керування модальним вікном ---
    const authModal = document.getElementById('authModal');
    const openLoginModalBtn = document.getElementById('openLoginModal');
    const closeBtn = document.querySelector('.modal-close-btn');

    if (openLoginModalBtn && authModal && closeBtn) {
        openLoginModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });
    } else {
        console.error('ПОМИЛКА: Не знайдено елементи для модального вікна (кнопка відкриття або саме вікно).');
    }

    // --- Ініціалізація Supabase клієнта ---
    const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co'; // Ваш URL проекту Supabase
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y'; // Ваш публічний "Anon Key"

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
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
    const registerFullNameInput = document.getElementById('registerFullName');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
    const registerButton = document.getElementById('registerButton');
    const registerErrorMessage = document.getElementById('registerErrorMessage');

    
    // --- Важлива перевірка наявності всіх елементів форми ---
    if (!showLoginButton || !showRegisterButton || !loginSection || !registerSection ||
        !loginForm || !loginEmailInput || !loginPasswordInput || !loginButton || !loginErrorMessage ||
        !registerForm || !registerFullNameInput || !registerEmailInput || !registerPasswordInput || !registerConfirmPasswordInput || !registerButton || !registerErrorMessage) {
        console.error('ПОМИЛКА: Один або кілька необхідних елементів DOM для форми не знайдено. Перевірте ID в HTML та JS.');
        return;
    }

    // --- Слухачі подій для кнопок перемикання Вхід/Реєстрація ---
    showLoginButton.addEventListener('click', () => {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        showLoginButton.classList.add('active');
        showRegisterButton.classList.remove('active');
        loginErrorMessage.textContent = '';
    });

    showRegisterButton.addEventListener('click', () => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        showLoginButton.classList.remove('active');
        showRegisterButton.classList.add('active');
        registerErrorMessage.textContent = '';
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
                console.error('Помилка входу Supabase:', error.message);
                loginErrorMessage.textContent = error.message || 'Неправильний email або пароль.';
            } else if (data.user) {
                const { data: adminProfile, error: adminProfileError } = await supabase
                    .from('profiles_admin')
                    .select('user_id')
                    .eq('user_id', data.user.id)
                    .single();

                if (adminProfileError || !adminProfile) {
                    await supabase.auth.signOut();
                    loginErrorMessage.textContent = 'У вас немає прав доступу до адмін-панелі.';
                } else {
                    loginErrorMessage.textContent = 'Вхід успішний! Перенаправлення...';
                    loginErrorMessage.style.color = '#4CAF50';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 500);
                }
            } else {
                loginErrorMessage.textContent = 'Неправильний email або пароль.';
            }

        } catch (err) {
            console.error('Невідома помилка під час входу:', err);
            loginErrorMessage.textContent = 'Виникла невідома помилка. Спробуйте ще раз.';
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Увійти';
        }
    });

    // --- Логіка реєстрації НОВОГО АДМІНІСТРАТОРА (автоматичне додавання) ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = registerFullNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();
        const confirmPassword = registerConfirmPasswordInput.value.trim();

        registerErrorMessage.textContent = '';
        registerButton.disabled = true;
        registerButton.textContent = 'Реєстрація...';

        if (fullName === '' || email === '' || password === '' || confirmPassword === '') {
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
            } else if (data.user) {
                // Крок 2: Увійти щойно зареєстрованим користувачем, щоб активувати сесію.
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (signInError) {
                    console.error('Помилка входу після реєстрації:', signInError.message);
                    registerErrorMessage.textContent = `Реєстрація успішна, але не вдалося автоматично увійти.`;
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
                        full_name: fullName
                    });

                if (insertError) {
                    console.error('Помилка додавання до profiles_admin:', insertError.message);
                    registerErrorMessage.textContent = `Реєстрація успішна, але сталася помилка при наданні прав адміністратора.`;
                } else {
                    registerErrorMessage.textContent = 'Реєстрація успішна! Перенаправлення...';
                    registerErrorMessage.style.color = '#4CAF50';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 500);
                }
            } else {
                registerErrorMessage.textContent = 'Невідома помилка під час реєстрації.';
            }

        } catch (err) {
            console.error('Невідома помилка під час реєстрації:', err);
            registerErrorMessage.textContent = 'Виникла невідома помилка. Спробуйте ще раз.';
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Зареєструватися';
        }
    });
});