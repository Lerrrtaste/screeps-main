import { Effect, ForkEffect, takeEvery, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authActions } from './slice';
import { apiActions } from '../api/slice';
import { setTokenHeader } from '../../api/ScreepsAPI';

export function* watchSetToken(
    action: PayloadAction<any>
): Generator<Effect, void> {
    if (typeof action.payload !== 'string') {
        console.log("Non string token recieved");
    } else {
        console.log("Sage: setting token: " + action.payload);
        setTokenHeader(action.payload);
        yield put(apiActions.apiGetMe());
    }
}

export function* watchAuthSagas(): Generator<ForkEffect, void> {
    yield takeEvery(authActions.setToken, watchSetToken);
}

const authSagas = watchAuthSagas;

export default authSagas;
