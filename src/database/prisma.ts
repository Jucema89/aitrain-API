import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

declare var global: any
let prisma: PrismaClient

if (process.env.ENVIRONMENT === 'production') {
  prisma = new PrismaClient()

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })

} else {
    if (!global.prisma) {
    global.prisma = new PrismaClient()
    
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma



