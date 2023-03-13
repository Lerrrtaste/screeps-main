import { all, fork, AllEffect, ForkEffect } from 'redux-saga/effects';
import authSagas from './auth/saga';
import apiSagas from './api/saga';

export default function* rootSaga(): Generator<
  AllEffect<ForkEffect<void>>,
  void,
  unknown
> {
  yield all([fork(authSagas)]);
  yield all([fork(apiSagas)]);
}
