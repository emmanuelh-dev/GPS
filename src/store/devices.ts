import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Device } from "../../types";

interface DevicesState {
  items: Record<string, Device>;
  selectedId: string | null;
  selectedIds: string[];
  sendSmsOpen: boolean;
  massSmsOpen: boolean;
  massSmsDevices: string[];
}

const initialState: DevicesState = {
  items: {},
  selectedId: null,
  selectedIds: [],
  sendSmsOpen: false,
  massSmsOpen: false,
  massSmsDevices: [],
};

const { reducer, actions } = createSlice({
  name: "devices",
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Device[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    update(state, action: PayloadAction<Device[]>) {
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    select(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    selectId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
      state.selectedIds = state.selectedId ? [state.selectedId] : [];
    },
    selectIds(state, action: PayloadAction<string[]>) {
      state.selectedIds = action.payload;
      [state.selectedId] = state.selectedIds;
    },
    remove(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    toggleSendSms(state) {
      state.sendSmsOpen = !state.sendSmsOpen;
    },
    toggleMassSms(state) {
      state.massSmsOpen = !state.massSmsOpen;
    },
    updateMassSmsDevices(state, action: PayloadAction<string[]>) {
      state.massSmsDevices = action.payload;
    },
  },
});

export { actions as devicesActions };
export { reducer as devicesReducer };
