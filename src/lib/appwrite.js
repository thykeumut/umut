import { Account, Client, ID, Realtime, TablesDB } from 'appwrite'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6aec4b77002cb374916e')

const tables = new TablesDB(client)
const account = new Account(client)
const realtime = new Realtime(client)
const databaseId = '6aec5c0100163d1ab125'
const tableId = '6aec5c36003a2ebf0e50'
const visitorTableId = '6af44551000fafbb5054'
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

// Kartlar ve diğer kayıtlar aynı tabloda tutulur. `kind: 'cv'` işaretli eski
// bir satır kalmış olsa bile pano bunu kart olarak göstermez.
export async function loadRemoteSites() {
  const result = await tables.listRows({ databaseId, tableId, ttl: 0 })
  const rows = result.rows.map(unpack).filter(Boolean)
  return rows.filter((row) => !row.kind || row.kind === 'site')
}

export async function loadRemoteBriefs() {
  const result = await tables.listRows({ databaseId, tableId, ttl: 0 })
  return result.rows
    .map(unpack)
    .filter((row) => row?.kind === 'brief' || row?.kind === 'feedback')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function ensureVisitorSession() {
  try {
    await account.get()
  } catch (error) {
    if (error?.code !== 401) throw error
    await account.createAnonymousSession()
  }
}

export async function createRemoteBrief(brief) {
  await ensureVisitorSession()
  const payload = {
    kind: 'brief',
    id: ID.unique(),
    createdAt: new Date().toISOString(),
    projectType: String(brief.projectType || '').slice(0, 80),
    goal: String(brief.goal || '').trim().slice(0, 420),
    audience: String(brief.audience || '').trim().slice(0, 120),
    style: String(brief.style || '').slice(0, 100),
    contact: String(brief.contact || '').trim().slice(0, 140),
  }
  return tables.createRow({ databaseId, tableId, rowId: ID.unique(), data: { data: JSON.stringify(payload) } })
}

export async function createRemoteFeedback(feedback) {
  await ensureVisitorSession()
  const payload = {
    kind: 'feedback',
    id: ID.unique(),
    createdAt: new Date().toISOString(),
    subject: String(feedback.subject || 'Genel geri bildirim').slice(0, 80),
    message: String(feedback.message || '').trim().slice(0, 600),
    contact: String(feedback.contact || '').trim().slice(0, 140),
  }
  return tables.createRow({ databaseId, tableId, rowId: ID.unique(), data: { data: JSON.stringify(payload) } })
}

export async function createRemoteVisit(day) {
  await ensureVisitorSession()
  const payload = { kind: 'visit', id: ID.unique(), day, createdAt: new Date().toISOString() }
  return tables.createRow({ databaseId, tableId, rowId: ID.unique(), data: { data: JSON.stringify(payload) } })
}

export async function loadRemoteVisits() {
  const result = await tables.listRows({ databaseId, tableId, ttl: 0 })
  return result.rows.map(unpack).filter((row) => row?.kind === 'visit')
}

export async function requestVisitorEmailLink(email) {
  const userId = ID.unique()
  const url = new URL(window.location.href)
  url.searchParams.delete('userId')
  url.searchParams.delete('secret')
  return account.createMagicURLToken({ userId, email: String(email).trim().toLowerCase(), url: url.toString() })
}

export async function completeVisitorEmailLink() {
  const params = new URLSearchParams(window.location.search)
  const userId = params.get('userId')
  const secret = params.get('secret')
  if (!userId || !secret) return null
  await account.createSession({ userId, secret })
  const user = await account.get()
  const url = new URL(window.location.href)
  url.searchParams.delete('userId')
  url.searchParams.delete('secret')
  window.history.replaceState({}, '', url)
  return user
}

export async function saveVerifiedVisitor(user) {
  const rowId = String(user.$id)
  const data = { email: String(user.email || '').toLowerCase() }
  try {
    return await tables.createRow({ databaseId, tableId: visitorTableId, rowId, data })
  } catch (error) {
    if (error?.code !== 409) throw error
    return tables.updateRow({ databaseId, tableId: visitorTableId, rowId, data })
  }
}

export async function loadVerifiedVisitors() {
  const result = await tables.listRows({ databaseId, tableId: visitorTableId, ttl: 0 })
  return result.rows.map((row) => ({ id: row.$id, email: row.email, createdAt: row.$createdAt }))
}

export async function deleteRemoteBrief(rowId) {
  return tables.deleteRow({ databaseId, tableId, rowId })
}

export async function loginAdmin(email, password) {
  return account.createEmailPasswordSession({ email, password })
}

// Yerel "yönetici" işareti kalmış ama Appwrite oturumu düşmüş olabilir.
// Yalnızca kesin 401 durumunda false döner; ağ hatalarında oturumu korur.
export async function hasAdminSession() {
  try {
    await account.get()
    return true
  } catch (err) {
    if (err?.code === 401) return false
    return true
  }
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
      if (pack(oldSite) !== data.data) {
        await tables.updateRow({ databaseId, tableId, rowId: oldSite._rowId, data })
      }
    } else {
      await tables.createRow({ databaseId, tableId, rowId: ID.unique(), data })
    }
  }
}

export function subscribeToSites(callback) {
  return realtime.subscribe(channel, callback)
}
