const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

// Zmieniamy nazwę na _supabase, żeby uniknąć błędu "already declared"
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Sprawdzanie sesji
async function checkUserSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    const profileLink = document.getElementById('profile-link');
    const authSection = document.getElementById('auth-section');

    if (session) {
        if (profileLink) profileLink.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        return session;
    } else {
        if (profileLink) profileLink.style.display = 'none';
        if (authSection) authSection.style.display = 'block';
        return null;
    }
}

// 2. Obsługa Rejestracji
async function handleSignUp(email, password, username) {
    const widget = document.getElementById('captcha-register');
    const captchaResponse = hcaptcha.getResponse(widget);

    if (!captchaResponse) {
        alert("Proszę potwierdzić hCaptcha!");
        return;
    }

    const { data, error } = await _supabase.auth.signUp({
        email,
        password,
        options: {
            captchaToken: captchaResponse,
            data: { username: username }
        }
    });

    if (error) {
        alert("Błąd rejestracji: " + error.message);
        hcaptcha.reset(widget);
    } else {
        alert("Konto utworzone! Sprawdź e-mail.");
    }
}

// 3. Obsługa Logowania
async function handleLogin(email, password) {
    const widget = document.getElementById('captcha-login');
    const captchaResponse = hcaptcha.getResponse(widget);

    if (!captchaResponse) {
        alert("Proszę potwierdzić hCaptcha!");
        return;
    }

    const { error } = await _supabase.auth.signInWithPassword({
        email,
        password,
        options: {
            captchaToken: captchaResponse
        }
    });

    if (error) {
        alert("Błąd logowania: " + error.message);
        hcaptcha.reset(widget);
    } else {
        // Zamiast reload, idziemy na profil
        window.location.href = 'profile.html';
    }
}

// 4. Wylogowanie
async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA ---
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkUserSession();

    // Logika przycisku wyloguj
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Wyświetlanie danych na profile.html
    if (session && document.getElementById('display-email')) {
        document.getElementById('display-email').innerText = session.user.email;
        const { data: profile } = await _supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();
        if (profile) document.getElementById('display-username').innerText = profile.username;
    }

    // Event Listenery dla formularzy
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin(
                document.getElementById('l-email').value,
                document.getElementById('l-password').value
            );
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSignUp(
                document.getElementById('r-email').value,
                document.getElementById('r-password').value,
                document.getElementById('r-username').value
            );
        });
    }
});
