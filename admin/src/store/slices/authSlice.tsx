import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ILoginResponseModel } from "../../models/account";
import type { IAuthState } from "../state/app-state";

const initialState: IAuthState = {
  _id: "",
  email: "",
  phone: "",
  role: "",  
  firstName: "",
  lastName: "",
  isActive: false,
  accessToken: "",
  refreshToken: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    adminLogin: (state: IAuthState, action: PayloadAction<ILoginResponseModel | any>) => {
      const payload = action.payload || {};
      const token = payload.accessToken || payload.token || "";
      const userObj = payload.user || payload.admin || {};
      const fullName = (userObj.name || "").trim();
      const nameParts = fullName ? fullName.split(" ") : [];
      const firstName = userObj.firstName || nameParts[0] || "Admin";
      const lastName = userObj.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

      state._id = userObj._id || userObj.id || "";
      state.email = userObj.email || "";
      state.phone = userObj.phone || "";
      state.role = userObj.role || "super_admin";
      state.firstName = firstName;
      state.lastName = lastName;
      state.isActive = userObj.isActive ?? userObj.active ?? true;
      state.accessToken = token;
      state.refreshToken = payload.refreshToken || "";
    },

    adminLogout: () => initialState,

    updateTokens: (state: IAuthState, action: PayloadAction<string>) => {
      state.accessToken = action.payload ?? "";
    },

    // updatePermission: (state, action: PayloadAction<IRoutesModel[]>) => {
    //   const permissions = action.payload?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //   const newPermission: ISidebarData[] = permissions?.map((route) => {
    //     const module = sidebarRoutes?.find((x) => x?.module === route?.name);
    //     if (route?.childRoute?.length > 0) {
    //       const childRoutes = route?.childRoute?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //       return {
    //         ...module,
    //         id: route?.id,
    //         childs: childRoutes
    //           ?.map((routeChild) => {
    //             const child = sidebarRoutes?.find((x) => x?.module === routeChild?.name);
    //             if (routeChild?.childRoute?.length > 0) {
    //               const subChildRoutes = routeChild?.childRoute?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //               return {
    //                 ...child,
    //                 id: routeChild?.id,
    //                 childs: subChildRoutes
    //                   ?.map((subRouteChild) => {
    //                     const child = sidebarRoutes?.find((x) => x?.module === subRouteChild?.name);
    //                     if (child?.name) {
    //                       return { id: subRouteChild?.id, ...child };
    //                     }
    //                   })
    //                   .filter((x) => !!x?.name),
    //               }
    //             }
    //             if (child?.name) {
    //               return { id: routeChild?.id, ...child };
    //             }
    //           })
    //           .filter((x) => !!x?.name),
    //       };
    //     } else {
    //       return { id: route?.id, ...module };
    //     }
    //   });
    //   state.permissions = newPermission?.filter((x) => !!x?.name) || [];
    // },
  },
});

export const { adminLogin, adminLogout, updateTokens } =
  authSlice.actions;

export default authSlice.reducer;
