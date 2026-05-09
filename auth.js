const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Sprawdzanie sesji użytkownika
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

// 3. Obsługa Logowania
async function handleLogin(email, password) {
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Błąd logowania: " + error.message);
    } else {
        // ZAMIAST: window.location.href = 'profile.html';
        // ROBIMY TO:
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.style.display = 'none'; // Ukrywa okno po zalogowaniu
        }
        
        // Odświeżamy widoczność paska nawigacji (żeby pokazał się "MÓJ PROFIL")
        await checkUserSession(); 
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
        // POPRAWIONO LITERÓWKĘ: z 'dispaly-username' na 'display-username'
        const usernameSpan = document.getElementById('display-username');

        if (emailSpan) {
            emailSpan.innerText = session.user.email;
        }

        if (usernameSpan) {
            try {
                // Pobieramy dane z tabeli 'profiles' (tam gdzie jest "przemek" - image_ad4d5a.png)
                const { data: profile, error } = await _supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', session.user.id)
                    .single();

                // Wyświetlamy nick z bazy danych, a jeśli nie ma go w tabeli, bierzemy z metadanych lub wyświetlamy "Brak nicku"
                usernameSpan.innerText = profile?.username || session.user.user_metadata?.username || "Brak nicku";
            } catch (err) {
                console.error("Błąd bazy danych:", err);
                usernameSpan.innerText = session.user.user_metadata?.username || "Brak nicku";
            }
        }
    } else {
        // Jeśli nie ma sesji, a użytkownik jest na profile.html, wyrzuć go na stronę główną
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
