const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Sprawdzanie sesji użytkownika
async function checkUserSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    const profileLink = document.getElementById('profile-link');
    const authSection = document.getElementById('auth-section');

    if (session) {
        // Jeśli jest sesja, pokazujemy link do profilu i UKRYWAMY okno logowania
        if (profileLink) profileLink.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        return session;
    } else {
        // Jeśli nie ma sesji, chowamy link do profilu i POKAZUJEMY okno logowania
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

// 3. Obsługa Logowania - TUTAJ ZMIANA
async function handleLogin(email, password) {
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Błąd logowania: " + error.message);
    } else {
        // Zamiast teleportacji do profile.html, po prostu odświeżamy widoczność elementów
        await checkUserSession();
        console.log("Zalogowano pomyślnie. Okno ukryte.");
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

    // Obsługa wyświetlania danych (jeśli elementy istnieją na stronie)
    if (session) {
        const emailSpan = document.getElementById('display-email');
        const usernameSpan = document.getElementById('display-username');

        if (emailSpan) emailSpan.innerText = session.user.email;

        if (usernameSpan) {
            try {
                const { data: profile } = await _supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', session.user.id)
                    .single();

                usernameSpan.innerText = profile?.username || session.user.user_metadata?.username || "Brak nicku";
            } catch (err) {
                usernameSpan.innerText = session.user.user_metadata?.username || "Brak nicku";
            }
        }
    }

    // Podpięcie przycisku wyloguj
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Formularz Logowania
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

    // Formularz Rejestracji
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
