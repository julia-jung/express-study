const request = require('request');

const forecast = (latitude, longitude, callback) => {
  const url =
    'https://api.darksky.net/forecast/2e5b06c9a6606e06f12800ec27bae0b7/' +
    latitude +
    ',' +
    longitude +
    '?units=si&lang=ko';

  request({ url, json: true }, (error, { body }) => {
    if (error) {
      callback('Unable to connect weather service!', undefined);
    } else if (body.error) {
      callback('Unable to find location!', undefined);
    } else if (!body.daily?.data?.[0]) {
      callback('Unable to get the weather data!', undefined);
    } else {
      callback(
        undefined,
        body.daily.data[0].summary +
          ' / 현재기온 : ' +
          body.currently.temperature +
          '도 / 강수확률 : ' +
          body.currently.precipProbability +
          '% / 오늘낮 최고 기온 : ' +
          body.daily.data[0].temperatureMax +
          '도 / 최저 기온 : ' +
          body.daily.data[0].temperatureMin +
          '도'
      );
    }
  });
};

module.exports = forecast;
