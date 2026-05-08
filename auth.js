const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MNYsFqV_N6ieH5uEY_hbQQ_uI87EYkC';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);












// 1. Sprawdzanie sesji i ukrywanie/pokazywanie elementów
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const profileLink = document.getElementById('profile-link');
    const authSection = document.getElementById('auth-section');

    if (session) {
        if (profileLink) profileLink.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        console.log("Zalogowano jako:", session.user.email);
        return session;
    } else {
        if (profileLink) profileLink.style.display = 'none';
        if (authSection) authSection.style.display = 'block';
        return null;
    }
}
// Fragment auth.js dla rejestracji
const signUp = async (email, password, username) => {
    // 1. Pobierz token z hCaptchy
    const captchaResponse = hcaptcha.getResponse();

    if (!captchaResponse) {
        alert("Proszę potwierdzić, że nie jesteś robotem!");
        return;
    }

    // 2. Wyślij do Supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            captchaToken: captchaResponse, // <--- TO ROZWIĄŻE TWÓJ BŁĄD
            data: {
                username: username
            }
        }
    });

    if (error) {
        alert("Błąd: " + error.message);
        hcaptcha.reset(); // Resetuje obrazki przy błędzie
    } else {
        alert("Sukces! Sprawdź maila.");
    }
}
// 2. Obsługa Rejestracji
async function handleSignUp(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert("Błąd rejestracji: " + error.message);
        return;
    }

    if (data.user) {
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert([{ id: data.user.id, username: username }]);

        if (profileError) console.error("Błąd profilu:", profileError);
        alert("Konto utworzone! Jeśli nie wyłączyłeś potwierdzenia e-mail, sprawdź pocztę.");
    }
}

// 3. Obsługa Logowania
async function handleLogin(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert("Błąd logowania: " + error.message);
    else window.location.reload();
}

// 4. Obsługa Wylogowania
async function handleLogout() {
    await supabaseClient.auth.signOut();
    alert("Wylogowano pomyślnie!");
    window.location.href = "index.html";
}

// --- GŁÓWNA LOGIKA PO ZAŁADOWANIU STRONY ---
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkUserSession();

    // OBSŁUGA STRONY PROFILU (profile.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);

        if (session) {
            document.getElementById('display-email').innerText = session.user.email;
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

            if (profile) document.getElementById('display-username').innerText = profile.username;
        } else {
            window.location.href = "index.html";
        }
    }

    // OBSŁUGA FORMULARZY (index.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin(document.getElementById('l-email').value, document.getElementById('l-password').value);
        });
    }

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
