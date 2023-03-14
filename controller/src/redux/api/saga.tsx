import { call, put, Effect, ForkEffect, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiActions } from './slice';
import { IFetchUserResponse, getMe } from '../../api/ScreepsAPI';
import { AxiosError, AxiosResponse } from 'axios';
/* import toast from 'react-hot-toast'; */

export function* watchApiSuccess(
    action: PayloadAction<any>
): Generator<Effect, void> {
    if (typeof action.payload !== 'object') {
        console.log("Non object data recieved");
    } else {
        console.log(action.payload);
    }
}

export function* watchApiError(
    action: PayloadAction<any>
): Generator<Effect, void> {
    if (typeof action.payload !== 'object') {
        console.log("Non object data recieved");
    } else {
        console.log(action.payload);
    }
}

export function* watchApiGetMe(
    action: PayloadAction<any>
): Generator<Effect, void> {
    console.log("HI");
    /* console.log(typeof (yield call(getMe))); */
    try {
        const response: AxiosResponse<IFetchUserResponse> = (yield call(getMe) ) as AxiosResponse<IFetchUserResponse>;
        yield put(apiActions.apiSuccess(response.data));
    } catch (error) {
        yield put(apiActions.apiError((error as AxiosError).message));
    }
}

export function* watchApiSagas(): Generator<ForkEffect, void> {
    yield takeEvery(apiActions.apiSuccess, watchApiSuccess);
    yield takeEvery(apiActions.apiError, watchApiError);
    yield takeEvery(apiActions.apiGetMe, watchApiGetMe);
}

const apiSagas = watchApiSagas;

export default apiSagas;
