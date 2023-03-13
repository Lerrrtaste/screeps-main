import { all, fork, AllEffect, ForkEffect } from 'redux-saga/effects';
import authSagas from './auth/saga';

export default function* rootSaga(): Generator<
  AllEffect<ForkEffect<void>>,
  void,
  unknown
> {
  yield all([fork(authSagas)]);
}
