import { describe, it, expect } from 'vitest'
import { connections } from '../../stores/connections.ts'
import type { Connection } from '../../types.ts'

const items: Connection[] = [
  { id: '1', name: 'Prod DB', host: 'prod.example.com', username: 'admin' },
  { id: '2', name: 'Dev MySQL', host: 'localhost', username: 'developer' },
  { id: '3', name: 'Staging', host: 'staging.internal', username: 'deploy' }
]

describe('connections.search', () => {
  it('retourne tout si la requête est vide', () => {
    expect(connections.search('')(items)).toHaveLength(3)
  })

  it('filtre par nom (insensible à la casse)', () => {
    const result = connections.search('MYSQL')(items)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filtre par host et par username', () => {
    expect(connections.search('localhost')(items)).toHaveLength(1)
    expect(connections.search('deploy')(items)).toHaveLength(1)
  })
})
