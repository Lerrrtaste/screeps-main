import { createSlice } from '@reduxjs/toolkit';

export interface IAuthSlice {
  token?: string;
}

const initialState: IAuthSlice = {
  token: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, token) => {
      state.token = token.payload;
    },
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

export const { actions: authActions, reducer: authReducer } = authSlice;
