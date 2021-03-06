import { applyMiddleware, createStore } from 'redux';
import { enableBatching, batchDispatchMiddleware } from 'redux-batched-actions';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { Router } from 'router5';
import { translationMiddleware } from '@mihanizm56/i18n-react';
import {
  IAdvancedStore,
  CustomReducerType,
  TranslationRequestType,
} from '../types';
import { createReducer } from './create-reducer';
import { rootSaga } from './root-saga';

const __DEV__ = process.env.NODE_ENV === "development"; // eslint-disable-line

interface IStoreParams {
  router: Router;
  requestToFetchDict: TranslationRequestType;
}

export const createAppStore = ({
  router,
  requestToFetchDict,
}: IStoreParams) => {
  const sagaMiddleware = createSagaMiddleware();

  const composeMiddlewares = [
    batchDispatchMiddleware,
    sagaMiddleware,
    translationMiddleware(requestToFetchDict),
  ];

  const enhancers = __DEV__
    ? composeWithDevTools(applyMiddleware(...composeMiddlewares))
    : applyMiddleware(...composeMiddlewares);

  const defaultReducer: CustomReducerType = createReducer(
    {},
  ) as CustomReducerType;

  const store: IAdvancedStore = createStore(
    enableBatching(defaultReducer),
    enhancers,
  ) as IAdvancedStore;

  // вытаскиваем диспатч для корневый саги
  const dispatch = store.dispatch;
  const rootSagaWithRouter = rootSaga.bind(null, { router, dispatch });

  // Add a dictionary to keep track of the registered async reducers and sagas
  // and give a possibility to run saga from field sagaMiddleware
  store.router = router;
  store.asyncReducers = {};
  store.asyncSagas = {};
  store.sagaMiddleware = sagaMiddleware;

  sagaMiddleware.run(rootSagaWithRouter);

  return store;
};
