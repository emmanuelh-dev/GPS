import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_SMART_SIM_BASE_URL || 'http://119.8.11.135';
const AUTH_TOKEN = import.meta.env.VITE_SMART_SIM_AUTH_TOKEN;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN
  }
});

if (!AUTH_TOKEN && process.env.NODE_ENV === 'development') {
  console.warn('ADVERTENCIA: No se ha configurado el token de autorización para Smart SIM API');
}

/**
 * Clase para manejar las operaciones de la API SmartSIM
 */
class SmartSimAPI {
  /**
   * Envía un SMS a una SIM específica
   * @param {string} iccid - El ICCID de la SIM
   * @param {string} text - El texto del mensaje a enviar
   * @returns {Promise} - Promesa con el resultado de la operación
   */
  async sendSMS(iccid, text) {
    try {
      if (!iccid) {
        throw new Error('ICCID no proporcionado');
      }
      
      const response = await axiosInstance.post(`/api/icc/${iccid}/send_sms`, { text });
      
      if (response.data && response.data.watcherId) {
        toast.success('SMS enviado correctamente');
        return response.data;
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      this._handleError(error, 'Error al enviar SMS');
      throw error;
    }
  }

  /**
   * Realiza un diagnóstico de la SIM
   * @param {string} iccid - El ICCID de la SIM
   * @param {boolean} isGlobal - Indica si el diagnóstico es global
   * @returns {Promise} - Promesa con el resultado del diagnóstico
   */
  async runDiagnostic(iccid, isGlobal = true) {
    try {
      if (!iccid) {
        throw new Error('ICCID no proporcionado');
      }
      
      const payload = isGlobal ? { is_global: "true" } : { is_local: "true" };
      const response = await axiosInstance.get(`/api/icc/${iccid}/diagnostic`, { data: payload });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error al realizar diagnóstico');
      throw error;
    }
  }

  /**
   * Resetea la red de una SIM
   * @param {string} iccid - El ICCID de la SIM
   * @param {boolean} isGlobal - Indica si el reset es global
   * @returns {Promise} - Promesa con el resultado de la operación
   */
  async resetNetwork(iccid, isGlobal = true) {
    try {
      if (!iccid) {
        throw new Error('ICCID no proporcionado');
      }
      
      const response = await axiosInstance.patch(
        `/api/icc/${iccid}/reset_network`, 
        { is_global: "true" }
      );
      
      toast.success('Red reiniciada correctamente');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error al resetear la red');
      throw error;
    }
  }

  /**
   * Obtiene información detallada de una SIM
   * @param {string} iccid - El ICCID de la SIM
   * @returns {Promise} - Promesa con la información de la SIM
   */
  async getSimInfo(iccid) {
    try {
      if (!iccid) {
        throw new Error('ICCID no proporcionado');
      }
      
      const response = await axiosInstance.get(`/api/icc/?icc=${iccid}`, {
        data: { TEXT: "TEXT" }
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error al obtener información de la SIM');
      throw error;
    }
  }

  /**
   * Maneja los errores de las peticiones
   * @private
   * @param {Error} error - El error capturado
   * @param {string} defaultMessage - Mensaje por defecto
   */
  _handleError(error, defaultMessage = 'Error en la operación') {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      // El servidor respondió con un código de error
      if (error.response.data && error.response.data.error) {
        errorMessage = `${defaultMessage}: ${error.response.data.error}`;
      } else if (error.response.status) {
        errorMessage = `${defaultMessage}: Error ${error.response.status}`;
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorMessage = `${defaultMessage}: No se recibió respuesta del servidor`;
    } else {
      // Error al configurar la petición
      errorMessage = `${defaultMessage}: ${error.message}`;
    }
    
    toast.error(errorMessage);
    console.error(errorMessage, error);
  }
}

// Exportamos una instancia única para usar en toda la aplicación
const smartSimAPI = new SmartSimAPI();
export default smartSimAPI;

// También exportamos métodos individuales para facilitar su uso
export const { sendSMS, runDiagnostic, resetNetwork, getSimInfo } = smartSimAPI;