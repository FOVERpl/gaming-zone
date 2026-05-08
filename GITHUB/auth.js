const SUPABASE_URL = 'https://tvjmddajptsuqqwwjaen.supabase.co';
const SUPABASE_KEY = 'TUTAJ_TWÓJ_KLUCZ_SB_PUBLISHABLE';

// To tworzy połączenie z Twoją bazą "strefa gier"
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNKCJA SPRAWDZAJĄCA SESJĘ (Uruchamia się na każdej stronie)
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const profileLink = document.getElementById('profile-link');
    const authSection = document.getElementById('auth-section');

    if (session) {
        // Użytkownik zalogowany
        if (profileLink) profileLink.style.display = 'block';
        if (authSection) authSection.style.display = 'none'; // Ukryj formularze na głównej
        console.log("Zalogowano jako:", session.user.email);
    } else {
        // Użytkownik niezalogowany
        if (profileLink) profileLink.style.display = 'none';
        if (authSection) authSection.style.display = 'block';
    }
}

// 3. REJESTRACJA
async function handleSignUp(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Błąd rejestracji: " + error.message);
        return;
    }

    if (data.user) {
        // Dodawanie wpisu do Twojej tabeli 'profiles' ze screena
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert([{ id: data.user.id, username: username }]);

        if (profileError) console.error("Błąd profilu:", profileError);
        alert("Konto utworzone! Potwierdź e-mail (sprawdź spam).");
    }
}

// 4. LOGOWANIE
async function handleLogin(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Błąd logowania: " + error.message);
    } else {
        window.location.reload(); // Odśwież stronę po zalogowaniu
    }
}

// --- EVENT LISTENERY (Obsługa formularzy na stronie głównej) ---

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();

    // Obsługa formularza logowania
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

    // Obsługa formularza rejestracji
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