import toast from 'react-hot-toast';

export function stopMotor({ numeroTelefono, nombreDelDispositivo }) {
  toast.success(`Deteniendo el dispositivo ${nombreDelDispositivo}`);
}

export function runMotor({ numeroTelefono, nombreDelDispositivo }) {
  toast.success(`Activando el dispositivo ${nombreDelDispositivo}`);
}