/* eslint-disable camelcase */

const currentYear = new Date().getFullYear()

exports.shorthands = undefined

exports.up = pgm => {
  pgm.sql(`INSERT INTO albums(id, name, year, created_at, updated_at) VALUES ('old_albums', 'old_albums', ${currentYear}, ${currentYear}, ${currentYear})`)

  pgm.sql("UPDATE songs SET album_id = 'old_albums' WHERE album_id IS NULL")

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id')

  pgm.sql('UPDATE songs SET album_id = NULL where album_id = `old_albums`')

  pgm.sql("DELETE FROM albums WHERE id = 'old_albums'")
}
