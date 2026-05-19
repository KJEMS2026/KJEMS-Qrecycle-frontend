import { supabase } from './supabase.js'
import { driverView } from './driver.js'
import { companyView } from './company.js'
import { adminView } from './admin.js'

export async function login() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        showLoginForm()
        return
    }

    const { data: user } = await supabase
        .from('user')
        .select('user_role')
        .eq('user_id', session.user.id)
        .single()

    const role = user?.user_role

    if (role === 'admin') adminView()
    if (role === 'driver') driverView()
    if (role === 'company') companyView()
}

function showLoginForm() {
    document.querySelector('.content').innerHTML = `
    <form id="loginForm">
    <input type="email" id="email" placeholder="email">
    <input type="password" id="password" placeholder="password">
    <button type="submit">Log ind</button>
    <p id="fejl"></p>
    </form> 
    `

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault()

        const {error} = await supabase.auth.signInWithPassword({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })

        if (error) {
            document.getElementById('fejl').textContent = 'Forkert auth'
            return
        }

        login()
    })
}

export async function logout() {
    await supabase.auth.signOut()
    showLoginForm()
}
