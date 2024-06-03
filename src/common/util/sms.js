import toast from 'react-hot-toast';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');

function sms({ phoneNumber, message, messages }) {
  const raw = JSON.stringify({
    icc: phoneNumber,
    message,
    messages,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  if (!phoneNumber || phoneNumber.length !== 19)
    return toast.error('No se ha ingresado un número de teléfono');

  fetch(
    'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-5075ff73-6671-403d-9b7e-7e0ca64f2ccb/default/sms',
    requestOptions
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((result) => {
      toast.success(`Mensaje enviado correctamente: ${result}`);
    })
    .catch((error) => {
      toast.error(`Error: ${error.message}`);
    });
  return true;
}

// Stops motor function
export function stopMotor({ phoneNumber, protocol }) {
  switch (protocol) {
    case 'teltonika':
      sms({
        phoneNumber,
        message: '  setdigout 1',
      });
      break;
    case 'gps103':
      sms({
        phoneNumber,
        message: 'quickstop123456',
      });
    default:
      break;
  }
}

// Starts motor function
export function runMotor({ phoneNumber, protocol }) {
  switch (protocol) {
    case 'teltonika':
      sms({ phoneNumber, message: '  setdigout 0' });
      break;
    case 'gps103':
      sms({ phoneNumber, message: 'resume123456' });
    default:
      sms({ phoneNumber, message: 'resume123456' });
      break;
  }
}

// Configures devices function
export function configDevice({ phoneNumber }) {
  sms({
    phoneNumber,
    messages: [
      'apn123456 m2mglobal.telefonica.mx',
      'dns123456 24.199.121.252 5001',
      'angle123456 30',
      'fix060s***n123456',
      'sleep123456 on',
    ],
  });
}

export function sendSMS({ phoneNumber, message }) {
  sms({ phoneNumber, message });
}
export function resumeDevice({ phoneNumber }) {
  sms({
    phoneNumber,
    messages: ['resume123456', 'fix060s***n123456'],
  });
}

export async function checkStatus({ phoneNumber }) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append(
    'Authorization',
    'Basic MjFmMjg0OTk4NmJlMTVjZjJhN2Q2ZmMzM2YxNjZjOGFkY2JhNjFiYTlmMDhlYWQ0NTg2YzlhM2ExNWE1MGE5MjpFQi1tdXBYUTBWWkFadVZsQkYzYlZuMzRTaTh1YTIzbzFhLUJvN1FKODVIS2FoYVVaSXBBVHVSYVhZMnhDdlgyOWRfNlBaVnBQbkJSdmw1X3d4WEVNUQ=='
  );

  const raw = JSON.stringify({
    icc: phoneNumber,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  const response = await fetch(
    'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-5075ff73-6671-403d-9b7e-7e0ca64f2ccb/axios/statusaxios',
    requestOptions
  );
  const result = await response.json();
  return result;
}

export async function resetRed({ phoneNumber }) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append(
    'Authorization',
    'Basic MjFmMjg0OTk4NmJlMTVjZjJhN2Q2ZmMzM2YxNjZjOGFkY2JhNjFiYTlmMDhlYWQ0NTg2YzlhM2ExNWE1MGE5MjpFQi1tdXBYUTBWWkFadVZsQkYzYlZuMzRTaTh1YTIzbzFhLUJvN1FKODVIS2FoYVVaSXBBVHVSYVhZMnhDdlgyOWRfNlBaVnBQbkJSdmw1X3d4WEVNUQ=='
  );

  const raw = JSON.stringify({
    icc: phoneNumber,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch(
    'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-5075ff73-6671-403d-9b7e-7e0ca64f2ccb/default/resetred',
    requestOptions
  )
    .then((response) => response.text())
    .then((result) =>
      toast
        .success(`Red reiniciada correctamente: ${result}`)
        .catch((error) => toast.error(`Error: ${error.message}`))
    );
}
