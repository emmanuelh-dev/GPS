import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: {},
  selectedId: null,
  selectedIds: [],
};

const { reducer, actions } = createSlice({
  name: "geofences",
  initialState,
  reducers: {
    refresh(state, action) {
      state.items = {}; 
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    update(state, action) {
      action.payload.forEach((item) => {
        state.items[item.id] = item;
      });
    },
    selectId(state, action) {
      state.selectedId = action.payload;
      state.selectedIds = state.selectedId ? [state.selectedId] : [];
    },
    selectIds(state, action) {
      state.selectedIds = action.payload;
      [state.selectedId] = state.selectedIds;
    },
  },
});

export { actions as geofencesActions };
export { reducer as geofencesReducer };
