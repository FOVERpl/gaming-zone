const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

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
    const { data, error } = await _supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username: username }
        }
    });

    if (error) {
        alert("Błąd rejestracji: " + error.message);
    } else {
        alert("Konto utworzone! Sprawdź e-mail, aby potwierdzić konto.");
    }
}

// 3. Obsługa Logowania
async function handleLogin(email, password) {
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Błąd logowania: " + error.message);
    } else {
        window.location.href = 'profile.html';
    }
}

// 4. Obsługa Wylogowania
async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA ---
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkUserSession();

    // A. Obsługa wyświetlania danych na stronie profilu (profile.html)
    if (session) {
        const emailSpan = document.getElementById('display-email');
        const usernameSpan = document.getElementById('display-username');

        if (emailSpan) {
            emailSpan.innerText = session.user.email;
        }

        if (usernameSpan) {
            // Dane 'username' zapisane podczas rejestracji lądują w user_metadata
            const nick = session.user.user_metadata?.username || "Brak nicku";
            usernameSpan.innerText = nick;
        }
    } else {
        // Jeśli nie ma sesji, a użytkownik próbuje wejść na profil - wyrzuć go na główną
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }

    // B. Przycisk wyloguj
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // C. Formularz Logowania (index.html)
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

    // D. Formularz Rejestracji (index.html)
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
