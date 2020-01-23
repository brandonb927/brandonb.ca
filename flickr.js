require('dotenv').config()

const fs = require('fs')
const Flickr = require('flickr-sdk')

var flickr = new Flickr(Flickr.OAuth.createPlugin(
  process.env.FLICKR_CONSUMER_KEY,
  process.env.FLICKR_CONSUMER_SECRET,
  process.env.FLICKR_OAUTH_TOKEN,
  process.env.FLICKR_OAUTH_TOKEN_SECRET
));


async function oauthFlow() {
  var oauth = new Flickr.OAuth(
    process.env.FLICKR_CONSUMER_KEY,
    process.env.FLICKR_CONSUMER_SECRET
  )

  const oauthReponse = await oauth.request('http://localhost:8888')
  const {
    oauth_token: oauthToken,
  } = oauthReponse.body

  const authorizationUrl = await oauth.authorizeUrl(oauthToken)

  open(authorizationUrl)
}


async function getPhotos() {
  console.log('Retrieving photos from Flickr...')

  const photosResponse = await flickr.people.getPhotos({
    user_id: 'me',
    per_page: 500,
    extras: 'date_taken,description,tags,url_c,url_o',
    min_taken_date: '2019-01-01 00:00:00',
    content_type: '1',
  })
  return photosResponse.body
}

async function fetchAndWriteFlickrData() {
  const {photos} = await getPhotos()
  const flickrData = []

  for (let i in photos.photo) {
    const {
      id,
      datetaken,
      description,
      tags,
      url_o,
      url_c,
    } = photos.photo[i]

    flickrData.push({
      id,
      description: description._content,
      tags,
      src_original: url_o,
      src: url_c,
      timestamp: datetaken,
    })
  }

  fs.writeFileSync('./_data/flickr-data.json', JSON.stringify(flickrData));

  console.log('Done!')
}

(async () => {
  await fetchAndWriteFlickrData()
})()