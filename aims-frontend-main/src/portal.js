import './style.css'
import { boot } from './lib/boot.js'
import { portalLayout } from './layouts/portal.js'
import { portalRoutes } from './pages/portal.js'

boot({ layout: portalLayout, routes: portalRoutes, home: '/portal', title: 'AIMFORCE Client Portal' })