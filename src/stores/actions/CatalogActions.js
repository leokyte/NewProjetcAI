import { SET_CATALOG_COLOR, SET_INPUT_ERROR_COLOR } from "./types";

export const setCatalogColor = (color) => ({ type: SET_CATALOG_COLOR, payload: color })

export const setInputCatalogColorError = (isError) => ({ type: SET_INPUT_ERROR_COLOR, payload: isError })
