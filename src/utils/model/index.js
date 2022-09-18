const albumsModel = ({
  id,
  name,
  year
}) => ({
  id,
  name,
  year
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

const playlistActivitiesModel = ({
  username,
  title,
  action,
  time
}) => ({
  username,
  title,
  action,
  time
})

module.exports = { albumsModel, playlistsModel, playlistActivitiesModel }
