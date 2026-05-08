const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

// Używamy jednej konsekwentnej nazwy: supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Sprawdzanie sesji
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
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

// 2. Obsługa Rejestracji (Z CAPTCHA)
async function handleSignUp(email, password, username) {
    const captchaResponse = hcaptcha.getResponse();

    if (!captchaResponse) {
        alert("Proszę potwierdzić, że nie jesteś robotem (Rejestracja)!");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            captchaToken: captchaResponse,
            data: { username: username }
        }
    });

    if (error) {
        alert("Błąd rejestracji: " + error.message);
        hcaptcha.reset();
    } else {
        alert("Konto utworzone! Sprawdź e-mail.");
    }
}

// 3. Obsługa Logowania (Z CAPTCHA)
async function handleLogin(email, password) {
    const captchaResponse = hcaptcha.getResponse();

    if (!captchaResponse) {
        alert("Proszę potwierdzić, że nie jesteś robotem (Logowanie)!");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
            captchaToken: captchaResponse
        }
    });

    if (error) {
        alert("Błąd logowania: " + error.message);
        hcaptcha.reset();
    } else {
        window.location.reload();
    }
}

// 4. Obsługa Wylogowania
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA ---
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkUserSession();

    // Obsługa profilu
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        if (session) {
            document.getElementById('display-email').innerText = session.user.email;
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
            if (profile) document.getElementById('display-username').innerText = profile.username;
        } else {
            window.location.href = "index.html";
        }
    }

    // Obsługa formularza LOGOWANIA
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin(
                document.getElementById('l-email').value, 
                document.getElementById('l-password').value
            );
        });
    }

    // Obsługa formularza REJESTRACJI
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignUp(
                document.getElementById('r-email').value,
                document.getElementById('r-password').value,
                document.getElementById('r-username').value
            );
        });
    }
});
