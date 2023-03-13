import { createSlice } from '@reduxjs/toolkit';

export interface IApiSlice {
  data: any,
  error: any,
}

const initialState: IApiSlice = {
  data: undefined,
  error: undefined,
};

export const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    apiGetMe: (state) => {
      state.data = undefined;
      state.error = undefined;
    },
    apiSuccess: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
    },
    apiError: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
    }
    // decrement: (state) => {
    //   state.value -= 1;
    // },
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload;
    // },
    // incrementAsync: (state) => {},
    // decrementAsync: (state) => {},
    // incrementByAmountAsync: (state, action: PayloadAction<number>) => {},
    // incrementByAmountAsyncSuccess: (state) => {},
    // incrementByAmountAsyncFailure: (state) => {},
  },

});

export const { actions: apiActions, reducer: apiReducer } = apiSlice;
