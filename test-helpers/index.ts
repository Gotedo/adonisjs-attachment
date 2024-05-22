/*
 * @gotedo/adonisjs-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi@gotedo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { config as dotEnvConfig } from 'dotenv'

dotEnvConfig()

export const fs = new Filesystem(join(__dirname, '__app'))

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!

/**
 * Setup AdonisJS application
 */
export async function setupApplication(
  additionalProviders?: string[],
  environment: 'web' | 'repl' | 'test' = 'test'
) {
  await fs.add(
    '.env',
    `
    R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
    R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
    R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
    `
  )
  await fs.add(
    'config/app.ts',
    `
    export const appKey = 'averylong32charsrandomsecretkey',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  )

  await fs.add(
    'config/bodyparser.ts',
    `
    const config = {
      whitelistedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      json: {
        encoding: 'utf-8',
        limit: '1mb',
        strict: true,
        types: [
          'application/json',
        ],
      },
      form: {
        encoding: 'utf-8',
        limit: '1mb',
        queryString: {},
        types: ['application/x-www-form-urlencoded'],
      },
      raw: {
        encoding: 'utf-8',
        limit: '1mb',
        queryString: {},
        types: ['text/*'],
      },
      multipart: {
        autoProcess: true,
        convertEmptyStringsToNull: true,
        processManually: [],
        encoding: 'utf-8',
        maxFields: 1000,
        limit: '20mb',
        types: ['multipart/form-data'],
      },
    }

    export default config
  `
  )

  await fs.add(
    'config/drive.ts',
    `
    export const disk = 'local'

    export const disks = {
      local: {
        driver: 'local',
        visibility: 'private',
        root: '${join(fs.basePath, 'uploads').replace(/\\/g, '/')}',
        serveFiles: true,
        basePath: '/uploads'
      },
      r2: {
        driver: 'r2',
        visibility: 'private',
        accountId: '${R2_ACCOUNT_ID}',
        key: '${R2_ACCESS_KEY_ID}',
        secret: '${R2_SECRET_ACCESS_KEY}',
        bucket: 'adonis-drive-r2-private',
      }
    }
  `
  )

  await fs.add(
    'config/database.ts',
    `const databaseConfig = {
      connection: 'sqlite',
      connections: {
        sqlite: {
          client: 'sqlite3',
          connection: {
            filename: '${join(fs.basePath, 'db.sqlite3').replace(/\\/g, '/')}',
          },
        },
      }
    }
    export default databaseConfig`
  )

  const app = new Application(fs.basePath, environment, {
    providers: ['@adonisjs/core', '@adonisjs/lucid', 'adonis-drive-r2'].concat(
      additionalProviders || []
    ),
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}

/**
 * Create users table
 */
async function createUsersTable(client: QueryClientContract) {
  await client.schema.createTable('users', (table) => {
    table.increments('id').notNullable().primary()
    table.string('username').notNullable().unique()
    table.string('avatar').nullable()
    table.string('cover_image').nullable()
  })
}

/**
 * Setup for tests
 */
export async function setup(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  await createUsersTable(db.connection())
}

/**
 * Performs cleanup
 */
export async function cleanup(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  await db.connection().schema.dropTableIfExists('users')
  await db.manager.closeAll()
  await fs.cleanup()
}
