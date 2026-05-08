const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

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

// 2. Obsługa Rejestracji
async function handleSignUp(email, password, username) {
    // Pobieramy token konkretnie z widgetu rejestracji
    const widgetId = document.getElementById('captcha-register');
    const captchaResponse = hcaptcha.getResponse(widgetId);

    if (!captchaResponse) {
        alert("Proszę potwierdzić hCaptcha w formularzu rejestracji!");
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
        hcaptcha.reset(widgetId);
    } else {
        alert("Konto utworzone! Sprawdź e-mail.");
    }
}

// 3. Obsługa Logowania
async function handleLogin(email, password) {
    // Pobieramy token konkretnie z widgetu logowania
    const widgetId = document.getElementById('captcha-login');
    const captchaResponse = hcaptcha.getResponse(widgetId);

    if (!captchaResponse) {
        alert("Proszę potwierdzić hCaptcha w formularzu logowania!");
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
        hcaptcha.reset(widgetId);
    } else {
        window.location.reload();
    }
}

// 4. Wylogowanie
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA PO ZAŁADOWANIU ---
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkUserSession();

    // Logika profilu (jeśli jesteśmy na profile.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        if (session) {
            const emailDisp = document.getElementById('display-email');
            const userDisp = document.getElementById('display-username');
            if (emailDisp) emailDisp.innerText = session.user.email;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
            if (profile && userDisp) userDisp.innerText = profile.username;
        }
    }

    // Formularz Logowania
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

    // Formularz Rejestracji
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
