// This function fetches the latest carbon emissions from openweathermap API
// Args include the zipcode of your location, ISO 3166 country code

if (!secrets.apiKey) {
  throw Error("Weather API Key is not available!")
}

const zipCode = `${args[0]},${args[1]}`

const geoCodingURL = "http://api.openweathermap.org/geo/1.0/zip?"

console.log(`Sending HTTP request to ${geoCodingURL}zip=${zipCode}`)

const geoCodingRequest = Functions.makeHttpRequest({
  url: geoCodingURL,
  method: "GET",
  params: {
    zip: zipCode,
    appid: secrets.apiKey,
  },
})

const geoCodingResponse = await geoCodingRequest

if (geoCodingResponse.error) {
  console.error(geoCodingResponse.error)
  throw Error("Request failed, try checking the params provided")
}

const latitude = geoCodingResponse.data.lat
const longitude = geoCodingResponse.data.lon

const url = `http://api.openweathermap.org/data/2.5/air_pollution?`

console.log(`Sending HTTP request to ${url}lat=${latitude}&lon=${longitude}`)

const emissionsRequest = Functions.makeHttpRequest({
  url: url,
  method: "GET",
  params: {
    lat: latitude,
    lon: longitude,
    appid: secrets.apiKey,
  },
})

// Execute the API request (Promise)
const emissionsResponse = await emissionsRequest
if (emissionsResponse.error) {
  console.error(emissionsResponse.error)
  throw Error("Request failed, try checking the params provided")
}

// gets the current temperature
const ans = emissionsResponse.data.list[0].components

// data contains amount of CO, NO2, SO2, PM2.5, PM10
return Buffer.concat([
  Functions.encodeInt256(ans.co * 1e18),
  Functions.encodeInt256(ans.no2 * 1e18),
  Functions.encodeInt256(ans.so2 * 1e18),
  Functions.encodeInt256(ans.pm2_5 * 1e18),
  Functions.encodeInt256(ans.pm10 * 1e18),
])