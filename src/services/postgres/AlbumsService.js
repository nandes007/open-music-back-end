const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { albumsModel } = require('../../utils/model')

class AlbumsService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum ({ name, year }) {
    const id = `albums-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return result.rows.map(albumsModel)[0]
  }

  async getSongsByAlbumId (id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      return []
    }

    return result.rows
  }

  async editAlbumById (id, { name, year }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }

  async uploadImage (id, path) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [path, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menambahkan gambar. Id tidak ditemukan')
    }
  }

  async isAlbumExists (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menambahkan gambar. Id tidak ditemukan')
    }
  }

  async likeAlbum (userId, albumId) {
    const id = `albums-likes-${nanoid(16)}`
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      const queryInsert = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id, album_id',
        values: [id, userId, albumId]
      }
      await this._pool.query(queryInsert)
      await this._cacheService.delete(`albums:${albumId}`)
    } else {
      const queryDelete = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id, album_id',
        values: [userId, albumId]
      }
      await this._pool.query(queryDelete)
      await this._cacheService.delete(`albums:${albumId}`)
    }
  }

  async getLikeAlbum (albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`)
      const res = { data: JSON.parse(result), header: true }
      return res
      // return JSON.parse(result)
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }

      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new NotFoundError('Id album tidak ditemukan')
      }

      const queryResult = parseInt(result.rows[0].count)

      await this._cacheService.set(`albums:${albumId}`, JSON.stringify(queryResult))
      const res = { data: queryResult, header: false }
      return res
      // return queryResult
    }
  }
}

module.exports = AlbumsService
