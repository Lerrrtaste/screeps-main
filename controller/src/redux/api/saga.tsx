import { Effect, ForkEffect, takeEvery, call, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { apiActions } from './slice';
import { getMe } from '../../api/ScreepsAPI';
import toast from 'react-hot-toast';

import {AxiosResponse} from 'axios';

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
    console.log("getting me");
    try {
        const response : AxiosResponse<any> = yield call(
            toast.promise,
                getMe(),
                {
                    loading: 'Loading',
                    success: `Successfully got you`,
                    error: 'Something happend'
                }
        ) as AxiosResponse<any>;
        console.log(response);
        yield put(apiActions.apiSuccess(response.data));
    } catch (e) {
        yield put(apiActions.apiError("sth"));
    }

    /*
     *     if (typeof response ===
     *         console.log("response");
     *         yield put(apiActions.apiSuccess(response.data));
     *     } catch (e) {
     *         console.log("error");
     *         yield put(apiActions.apiError(e);
     *     } */

}

export function* watchApiSagas(): Generator<ForkEffect, void> {
    yield takeEvery(apiActions.apiSuccess, watchApiSuccess);
    yield takeEvery(apiActions.apiError, watchApiError);
    yield takeEvery(apiActions.apiGetMe, watchApiGetMe);
}

const apiSagas = watchApiSagas;

export default apiSagas;
