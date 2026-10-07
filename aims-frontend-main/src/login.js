import './style.css'
import Alpine from 'alpinejs'
import { loginPage } from './pages/login.js'

document.getElementById('app').innerHTML = loginPage()
window.Alpine = Alpine
Alpine.start()