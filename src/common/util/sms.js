import toast from 'react-hot-toast';

export function stopMotor({ numeroTelefono, nombreDelDispositivo }) {
  toast.success(`Apagando motor del dispositivo ${nombreDelDispositivo}`);
}

export function runMotor({ numeroTelefono, nombreDelDispositivo }) {
  toast.success(`Reactivando motor del dispositivo ${nombreDelDispositivo}`);
}
