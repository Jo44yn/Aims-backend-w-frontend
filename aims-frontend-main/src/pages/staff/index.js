import { errorRoutes } from '../errors.js'
import { dashboardRoutes } from './dashboard.js'
import { salesRoutes } from './sales.js'
import { contractRoutes } from './contracts.js'
import { catalogRoutes } from './catalog.js'
import { procurementRoutes } from './procurement.js'
import { inventoryRoutes } from './inventory.js'
import { productionRoutes } from './production.js'
import { deliveryRoutes } from './delivery.js'
import { financeRoutes } from './finance.js'
import { adminRoutes } from './admin.js'

export const staffRoutes = [
  ...dashboardRoutes, ...salesRoutes, ...contractRoutes, ...catalogRoutes, ...procurementRoutes,
  ...inventoryRoutes, ...productionRoutes, ...deliveryRoutes, ...financeRoutes, ...adminRoutes, ...errorRoutes,
]