import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "alarms",
  initialState: {
    isActive: false,
    activeEvents: [],
    currentMessage: '',
    startTime: null,
    notifications: [],
    lastDismissTime: null, // Para evitar reactivación inmediata
  },
  reducers: {
    activateAlarm(state, action) {
      const { events, message } = action.payload;
      state.isActive = true;
      state.activeEvents = events;
      state.currentMessage = message;
      state.startTime = Date.now();
      state.notifications = events.map((event) => ({
        id: event.id,
        message: event.attributes.message,
        show: true,
      }));
    },
    addEvent(state, action) {
      const newEvent = action.payload;
      
      // Protección: no reactivar inmediatamente después de desactivar
      if (state.lastDismissTime && (Date.now() - state.lastDismissTime) < 2000) {
        console.log('Evento ignorado - alarma recién desactivada por el usuario');
        return;
      }
      
      // Solo agregar si no está ya en la lista
      const exists = state.activeEvents.find(event => event.id === newEvent.id);
      if (!exists) {
        state.activeEvents.push(newEvent);
        state.notifications.push({
          id: newEvent.id,
          message: newEvent.attributes.message,
          show: true,
        });
        
        // Si no hay alarma activa, activarla con el primer evento
        if (!state.isActive) {
          state.isActive = true;
          state.currentMessage = newEvent.attributes.message || 'Alert!';
          state.startTime = Date.now();
        } else {
          // Si ya hay una alarma activa, NO cambiar el startTime ni el mensaje principal
          // Solo actualizar el mensaje para mostrar que hay múltiples alarmas
          const totalAlarms = state.activeEvents.length;
          if (totalAlarms > 1) {
            state.currentMessage = `${totalAlarms} alarmas activas`;
          }
        }
      }
    },
    dismissAlarm(state) {
      const dismissedEvents = state.activeEvents.length;
      // Solo desactivar la UI y el audio, pero mantener referencia a los eventos
      state.isActive = false;
      state.currentMessage = '';
      state.startTime = null;
      state.notifications = [];
      state.lastDismissTime = Date.now();
      
      // Los activeEvents se mantienen para referencia histórica inmediata
      // pero la alarma ya no está "activa" (no suena ni muestra overlay)
      
      console.log(`Desactivadas ${dismissedEvents} alarma(s) por el usuario`);
    },
    removeNotification(state, action) {
      const eventId = action.payload;
      state.notifications = state.notifications.filter(notification => notification.id !== eventId);
      state.activeEvents = state.activeEvents.filter(event => event.id !== eventId);
      
      // IMPORTANTE: NO desactivar la alarma automáticamente aunque no queden eventos
      // La alarma solo debe desactivarse con dismissAlarm (acción manual del usuario)
      // Esto previene que la alarma se detenga accidentalmente
    },
    updateNotificationVisibility(state, action) {
      const { id, show } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.show = show;
      }
    },
    // Método para mantener la alarma activa sin importar las notificaciones
    keepAlarmActive(state) {
      if (state.isActive) {
        // Reafirmar que la alarma debe seguir activa
        state.isActive = true;
      }
    },
    // Método para limpiar completamente los eventos activos (uso administrativo)
    clearActiveEvents(state) {
      state.activeEvents = [];
    },
  },
});

export { actions as alarmsActions };
export { reducer as alarmsReducer };
