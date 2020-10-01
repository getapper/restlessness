import { RootState } from "redux-store";

export const getPaletteType = (state: RootState) => state?.ui.paletteType;
