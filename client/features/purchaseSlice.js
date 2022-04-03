import { createSlice } from "@reduxjs/toolkit";

const purchaseSlice = createSlice({
  name: "purchase",
  initialState: {
    isPurchasing: false,
    idx: null,
  },
  reducers: {
    SET_IS_PURCHASING: (state, action) => {
      state.isPurchasing = action.payload;
    },
    SET_PURCHASING_ITEM: (state, action) => {
      state.idx = action.payload;
    },
  },
});

export const { SET_IS_PURCHASING, SET_PURCHASING_ITEM } = purchaseSlice.actions;

export default purchaseSlice.reducer;
