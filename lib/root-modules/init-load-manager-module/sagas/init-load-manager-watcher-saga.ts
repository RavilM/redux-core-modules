import { take, fork } from 'redux-saga/effects';
import { INIT_LOAD_MANAGER_ACTION_SAGA } from '../actions';
import { InitLoadManagerActionPayloadType } from '../types';
import { initLoadManagerWorkerSaga } from './init-load-manager-worker-saga';

export function* initLoadManagerWatcherSaga() {
  while (true) {
    const {
      payload,
    }: { payload: InitLoadManagerActionPayloadType } = yield take(
      INIT_LOAD_MANAGER_ACTION_SAGA,
    );

    yield fork(initLoadManagerWorkerSaga, { payload });
  }
}
