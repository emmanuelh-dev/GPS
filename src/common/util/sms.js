import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-5075ff73-6671-403d-9b7e-7e0ca64f2ccb',
  headers: {
    'Content-Type': 'application/json',
  },
});

const isValidPhoneNumber = (phoneNumber) => {
  return phoneNumber && phoneNumber.length === 19;
};

async function sendSmsRequest({ phoneNumber, message, messages }) {
  if (!isValidPhoneNumber(phoneNumber)) {
    toast.error('No se ha ingresado un número de teléfono válido');
    return false;
  }

  try {
    const payload = {
      icc: phoneNumber,
      ...(message && { message }),
      ...(messages && { messages }),
    };

    await api.post('/default/sms', payload);
    toast.success('Mensaje enviado correctamente');
    return true;
  } catch (error) {
    toast.error(`Error: ${error.message || 'Desconocido'}`);
    return false;
  }
}

export function stopMotor({ phoneNumber, protocol }) {
  if (!protocol) {
    toast.error('Protocolo no especificado');
    return false;
  }

  const messageMap = {
    teltonika: 'setdigout 1',
    gps103: 'quickstop123456',
  };

  const message = messageMap[protocol];
  if (!message) {
    toast.error(`Protocolo no soportado: ${protocol}`);
    return false;
  }

  return sendSmsRequest({ phoneNumber, message });
}

export function runMotor({ phoneNumber, protocol }) {
  if (!protocol) {
    return sendSmsRequest({ phoneNumber, message: 'resume123456' });
  }

  const messageMap = {
    teltonika: 'setdigout 0',
    gps103: 'resume123456',
  };

  const message = messageMap[protocol] || 'resume123456';
  return sendSmsRequest({ phoneNumber, message });
}

export function configDevice({ phoneNumber }) {
  return sendSmsRequest({
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
  return sendSmsRequest({ phoneNumber, message });
}

export function resumeDevice({ phoneNumber }) {
  return sendSmsRequest({
    phoneNumber,
    messages: ['resume123456', 'fix060s***n123456'],
  });
}

export async function checkStatus({ phoneNumber }) {
  if (!isValidPhoneNumber(phoneNumber)) {
    toast.error('No se ha ingresado un número de teléfono válido');
    return null;
  }

  try {
    const { data } = await api.post('/axios/statusaxios', { icc: phoneNumber });
    return data;
  } catch (error) {
    toast.error(`Error al verificar estado: ${error.message || 'Desconocido'}`);
    return null;
  }
}

export async function getSimInfo({ phoneNumber }) {
  if (!isValidPhoneNumber(phoneNumber)) {
    toast.error('No se ha ingresado un número de teléfono válido');
    return null;
  }

  try {
    const { data } = await api.post('/default/infoSIM', { icc: phoneNumber });
    return data;
  } catch (error) {
    toast.error(`Error al obtener información SIM: ${error.message || 'Desconocido'}`);
    return null;
  }
}

export async function resetRed({ phoneNumber }) {
  if (!isValidPhoneNumber(phoneNumber)) {
    toast.error('No se ha ingresado un número de teléfono válido');
    return false;
  }

  try {
    const { data } = await api.post('/default/resetred', { icc: phoneNumber });
    toast.success(`Red reiniciada correctamente: ${data}`);
    return true;
  } catch (error) {
    toast.error(`Error al reiniciar red: ${error.message || 'Desconocido'}`);
    return false;
  }
}