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
        // Teraz authSection (nasze okno) zostanie ukryte, bo ma id="auth-section" w HTML
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
        // Po zalogowaniu odpalamy ponowne sprawdzenie sesji, 
        // które dzięki poprawce w kroku 1 ukryje okno logowania.
        await checkUserSession();
        
        // Jeśli jednak chcesz, żeby mimo wszystko przechodziło do profilu, zostaw to:
        // window.location.href = 'profile.html';
        
        // Jeśli chcesz zostać na stronie głównej i tylko schować okno, 
        // powyższa linijka window.location musi być usunięta lub zakomentowana.
    }
}

// 4. Obsługa Wylogowania
async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA ---
document.addEventListener('DOMContentLoaded', async () => {
    // Sprawdzamy sesję na starcie - jeśli użytkownik jest zalogowany, okno zniknie od razu
    const session = await checkUserSession();

    if (session) {
        const emailSpan = document.getElementById('display-email');
        const usernameSpan = document.getElementById('display-username');

        if (emailSpan) {
            emailSpan.innerText = session.user.email;
        }

        if (usernameSpan) {
            try {
                const { data: profile, error } = await _supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', session.user.id)
                    .single();

                usernameSpan.innerText = profile?.username || session.user.user_metadata?.username || "Brak nicku";
            } catch (err) {
                console.error("Błąd bazy danych:", err);
                usernameSpan.innerText = session.user.user_metadata?.username || "Brak nicku";
            }
        }
    } else {
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

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
