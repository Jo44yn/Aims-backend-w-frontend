import './style.css'
import { boot } from './lib/boot.js'
import { publicLayout } from './layouts/public.js'
import { publicRoutes } from './pages/public.js'

boot({ layout: publicLayout, routes: publicRoutes, home: '/', title: 'AIMFORCE' })