import './style.css'
import { boot } from './lib/boot.js'
import { staffLayout } from './layouts/staff.js'
import { staffRoutes } from './pages/staff/index.js'

boot({ layout: staffLayout, routes: staffRoutes, home: '/dashboard', title: 'AIMS' })