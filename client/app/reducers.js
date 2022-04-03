import { combineReducers } from "@reduxjs/toolkit";

import navSlice from "@features/navSlice";
import purchaseSlice from "@features/purchaseSlice";

export default combineReducers({
  purchase: purchaseSlice,
  nav: navSlice,
});
