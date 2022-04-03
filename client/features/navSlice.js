import { createSlice } from "@reduxjs/toolkit";

const navbarSlice = createSlice({
  name: "nav",
  initialState: {
    selectedNavItem: 0,
  },
  reducers: {
    SET_SELECTED_HEADER_LINK: (state, action) => {
      state.selectedNavItem = action.payload;
    },
  },
});

export const { SET_SELECTED_HEADER_LINK } = navbarSlice.actions;

export default navbarSlice.reducer;
