const albumsModel = ({
  id,
  name,
  year
}) => ({
  id,
  name,
  year
})

const songsModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id
})

const playlistsModel = ({
  id,
  name,
  username
}) => ({
  id,
  name,
  username
})

module.exports = { albumsModel, songsModel, playlistsModel }
