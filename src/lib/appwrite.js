import { Account, Client, ID, Realtime, TablesDB } from 'appwrite'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6aec4b77002cb374916e')

const tables = new TablesDB(client)
const account = new Account(client)
const realtime = new Realtime(client)
const databaseId = '6aec5c0100163d1ab125'
const tableId = '6aec5c36003a2ebf0e50'
const channel = `tablesdb.${databaseId}.tables.${tableId}.rows`

function unpack(row) {
  try {
    return { ...JSON.parse(row.data), _rowId: row.$id }
  } catch {
    return null
  }
}

function pack(site) {
  const { _rowId, ...data } = site
  return JSON.stringify(data)
}

export async function loadRemoteSites() {
  const result = await tables.listRows({ databaseId, tableId, ttl: 0 })
  return result.rows.map(unpack).filter(Boolean)
}

export async function loginAdmin(email, password) {
  return account.createEmailPasswordSession({ email, password })
}

export async function logoutAdmin() {
  try {
    await account.deleteSession({ sessionId: 'current' })
  } catch {
    // The session may already have been removed.
  }
}

export async function saveRemoteSites(sites) {
  const current = await loadRemoteSites()
  const currentById = new Map(current.map((site) => [site.id, site]))
  const nextIds = new Set(sites.map((site) => site.id))

  for (const oldSite of current) {
    if (oldSite.id && !nextIds.has(oldSite.id)) {
      await tables.deleteRow({ databaseId, tableId, rowId: oldSite._rowId })
    }
  }

  for (const site of sites) {
    const oldSite = currentById.get(site.id)
    const data = { data: pack(site) }
    if (oldSite?._rowId) {
      await tables.updateRow({ databaseId, tableId, rowId: oldSite._rowId, data })
    } else {
      await tables.createRow({ databaseId, tableId, rowId: ID.unique(), data })
    }
  }
}

export function subscribeToSites(callback) {
  return realtime.subscribe(channel, callback)
}
