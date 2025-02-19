import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "inmates",
  initialState: {
    items: {},
  },
  reducers: {
    update(state, action) {
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
  },
});

export { actions as inmatesActions };
export { reducer as inmatesReducer };
