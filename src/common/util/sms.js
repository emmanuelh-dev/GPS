import toast from 'react-hot-toast';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append(
  'Authorization',
  'Basic MjFmMjg0OTk4NmJlMTVjZjJhN2Q2ZmMzM2YxNjZjOGFkY2JhNjFiYTlmMDhlYWQ0NTg2YzlhM2ExNWE1MGE5MjpFQi1tdXBYUTBWWkFadVZsQkYzYlZuMzRTaTh1YTIzbzFhLUJvN1FKODVIS2FoYVVaSXBBVHVSYVhZMnhDdlgyOWRfNlBaVnBQbkJSdmw1X3d4WEVNUQ==',
);

function sms({ phoneNumber, message }) {
  const raw = JSON.stringify({
    icc: phoneNumber,
    message,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  if (phoneNumber.length === 19) {
    if (phoneNumber.length === 19) {
      setTimeout(() => {
        fetch(
          'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-5075ff73-6671-403d-9b7e-7e0ca64f2ccb/default/sms',
          requestOptions,
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
      }, 2000); // Retraso de 2 segundos
      return;
    }

    toast.error('Este dispositivo no tiene número de teléfono válido');
  }
  toast.error('Este dispositivo no tiene numero de telefono valido');
}

export async function stopMotor({ phoneNumber }) {
  await sms({ phoneNumber, message: 'quickstop123456' });
}

export async function runMotor({ phoneNumber }) {
  await sms({ phoneNumber, message: 'quickstop123456' });
}

export async function configDevice({ phoneNumber }) {
  // DNS configuration
  await sms({ phoneNumber, message: 'apn123456 m2mglobal.telefonica.mx' });
  // Timeout configuration
  await sms({ phoneNumber, message: 'fix090s***n123456' });
  // APN Configuration
  await sms({ phoneNumber, message: 'dns123456 24.199.121.252 5001' });
}
