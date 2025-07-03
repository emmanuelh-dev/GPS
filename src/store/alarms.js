import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "alarms",
  initialState: {
    isActive: false,
    activeEvents: [],
    currentMessage: '',
    startTime: null,
    notifications: [],
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
      // Solo agregar si no está ya en la lista
      const exists = state.activeEvents.find(event => event.id === newEvent.id);
      if (!exists) {
        state.activeEvents.push(newEvent);
        state.notifications.push({
          id: newEvent.id,
          message: newEvent.attributes.message,
          show: true,
        });
        // Si no hay alarma activa, activarla
        if (!state.isActive) {
          state.isActive = true;
          state.currentMessage = newEvent.attributes.message || 'Alert!';
          state.startTime = Date.now();
        }
      }
    },
    dismissAlarm(state) {
      state.isActive = false;
      state.activeEvents = [];
      state.currentMessage = '';
      state.startTime = null;
      state.notifications = [];
    },
    removeNotification(state, action) {
      const eventId = action.payload;
      state.notifications = state.notifications.filter(notification => notification.id !== eventId);
      state.activeEvents = state.activeEvents.filter(event => event.id !== eventId);
      
      // Si no quedan eventos activos, desactivar la alarma
      if (state.activeEvents.length === 0) {
        state.isActive = false;
        state.currentMessage = '';
        state.startTime = null;
      }
    },
    updateNotificationVisibility(state, action) {
      const { id, show } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.show = show;
      }
    },
  },
});

export { actions as alarmsActions };
export { reducer as alarmsReducer };
