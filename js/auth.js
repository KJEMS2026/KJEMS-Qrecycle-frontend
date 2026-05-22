import {supabase} from './supabase.js'
import {driverView} from './driver.js'
import {companyView} from './company.js'
import {pickupRequestView} from './active-pickup-requests.js'

export async function login() {
    const {data: {session}} = await supabase.auth.getSession()

    if (!session) {
        showLoginForm()
        return
    }

    const {data: user} = await supabase
        .from('user')
        .select('user_role')
        .eq('id', session.user.id)
        .single()

    const role = user?.user_role

    if (role === 'ADMIN') pickupRequestView()
    if (role === 'DRIVER') driverView()
    if (role === 'COMPANY') companyView()
}

function showLoginForm() {
    document.querySelector('.content').innerHTML = `
    <div class="login-wrapper">
        <div class="login-brand">
            <img src="docs/image/logo.png" alt="Qrecycle-logo">
        </div>
        <div class="login-form-panel">
            <div class="login-form-inner">
                <h1>Velkommen tilbage</h1>
                <form id="loginForm">
    <div class="form-group">
        <label>E-mail</label>
        <input type="email" id="email" placeholder="email">
    </div>
    <div class="form-group">
        <label>Adgangskode</label>
        <input type="password" id="password" placeholder="password">
    </div>
    <button type="submit" class="btn-login">Log ind</button>
    <p id="fejl"></p>
</form>
    </div>
    </div>
    </div>
    `

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault()

        const {error} = await supabase.auth.signInWithPassword({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })

        if (error) {
            document.getElementById('fejl').textContent = 'Forkert e-mail eller adgangskode.'
            return
        }

        login()
    })
}

export async function logout() {
    await supabase.auth.signOut()
    showLoginForm()
}

export async function getSessionUserId() {
    const { data: { session } } = await supabase.auth.getSession()
    return session.user.id
}
