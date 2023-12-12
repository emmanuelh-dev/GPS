import toast from 'react-hot-toast';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append(
  'Authorization',
  'Basic MjFmMjg0OTk4NmJlMTVjZjJhN2Q2ZmMzM2YxNjZjOGFkY2JhNjFiYTlmMDhlYWQ0NTg2YzlhM2ExNWE1MGE5MjpFQi1tdXBYUTBWWkFadVZsQkYzYlZuMzRTaTh1YTIzbzFhLUJvN1FKODVIS2FoYVVaSXBBVHVSYVhZMnhDdlgyOWRfNlBaVnBQbkJSdmw1X3d4WEVNUQ==',
);

const raw = JSON.stringify({
  text: 'fix090s***n123456',
});

const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow',
};

function sms({ phoneNumber }) {
  if (phoneNumber.length === 19) {
    fetch(
      `http://119.8.11.135/api/icc/${phoneNumber}/send_sms`,
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => toast.success(`Mensaje enviado a ${result}`))
      .catch((error) => toast.error(`Error: ${error}`));
    return;
  }
  toast.error('Este dispositivo no tiene numero de telefono valido');
}

export function stopMotor({ phoneNumber, deviceName }) {
  sms({ phoneNumber, message: 'quickstop123456' });
}

export function runMotor({ phoneNumber, deviceName }) {
  console.log('phoneNumber', phoneNumber, deviceName);
  sms({ phoneNumber, message: 'quickstop123456' });
}

export function configDevice({ phoneNumber, deviceName }) {
  // DNS configuration
  sms({ phoneNumber, message: 'apn123456 m2mglobal.telefonica.mx' });
  // Timeout configuration
  sms({ phoneNumber, message: 'fix090s***n123456' });
  // APN Configuration
  sms({ phoneNumber, message: 'dns123456 24.199.121.252 5001' });
}
