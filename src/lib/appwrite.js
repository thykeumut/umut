import { Client, TablesDB } from 'appwrite'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6aec4b77002cb374916e')
const tables = new TablesDB(client)
const databaseId = '6aec5c0100163d1ab125'
const tableId = '6aec5c36003a2ebf0e50'

export async function loadRemoteSites() {
  const result = await tables.listRows({ databaseId, tableId, ttl: 0 })
  return result.rows.map((row) => JSON.parse(row.data))
}
