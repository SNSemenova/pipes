import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { SocketManager } from './SocketManager.tsx';
import { store } from './app/store'
import { Provider } from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <SocketManager>
      <App />
    </SocketManager>
  </Provider>,
  document.getElementById('root')
);
