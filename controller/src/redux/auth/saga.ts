import { Effect, ForkEffect, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authActions } from './slice';

export function* watchSetToken(
    action: PayloadAction<any>
): Generator<Effect, void> {
    if (typeof action.payload !== 'string') {
        console.log("Non string token recieved");
    } else {
        console.log("Sage: setting token: " + action.payload);
    }
}

export function* watchAuthSagas(): Generator<ForkEffect, void> {
    yield takeEvery(authActions.setToken, watchSetToken);
}

const authSagas = watchAuthSagas;

export default authSagas;
