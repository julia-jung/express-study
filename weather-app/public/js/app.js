const weatherForm = document.querySelector('form');
const search = document.querySelector('input');
const errorMsg = document.querySelector('#error');
const forecastMsg = document.querySelector('#forecast');

weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const location = search.value;
  console.log(location);

  errorMsg.textContent = 'Loading...';
  forecastMsg.textContent = '';

  fetch('/weather?address=' + location).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        errorMsg.textContent = data.error;
        forecastMsg.innerHTML = '';
      } else {
        errorMsg.textContent = '';
        forecastMsg.innerHTML =
          '<strong>Weather Forecast for ' +
          data.location +
          '</strong> : ' +
          data.forecast;
      }
    });
  });
});
