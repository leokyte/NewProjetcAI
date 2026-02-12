import {
  PRINTER_SET_DEVICE,
  PRINTER_SET_DEVICE_PAPER_TYPE,
  PRINTER_SET_DEVICE_TEXT_SIZE,
  PRINTER_SET_REPEAT_NUMBER
} from '../actions/types';

const INITIAL_STATE = {
  id: null,
  name: null,
  type: null,
  paperTypeId: 1,
  repeatPrint: 1,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state;
    case PRINTER_SET_DEVICE:
      return { ...state, id: action.payload.id, name: action.payload.name, type: action.payload.type };
    case PRINTER_SET_DEVICE_PAPER_TYPE:
      return { ...state, paperTypeId: action.payload.paperTypeId };
    case PRINTER_SET_DEVICE_TEXT_SIZE:
      return { ...state, textSizeId: action.payload.textSizeId };
    case PRINTER_SET_REPEAT_NUMBER:
      return { ...state, repeatPrint: action.payload }
  }
};
