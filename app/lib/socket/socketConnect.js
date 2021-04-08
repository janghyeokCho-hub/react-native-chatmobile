import SocketIOClient from 'socket.io-client';
import { getServer } from '@/config';

let socketInstance;

export const getSocketInstance = (
  { token, accessid },
  events,
  connectCallback,
  disconnectCallback,
  reconnectCallback,
) => {
  if (socketInstance) return socketInstance;

  socketInstance = SocketIOClient(getServer('EVENT'), {
    token,
    accessid,
    path: '/socket.io',
    forceNew: true,
    transports: ['websocket'],
  });

  socketInstance.on('connect', () => {
    console.log('token auth :: send');
    socketInstance.emit('message', { token, accessid });
  });

  socketInstance.on('reconnect', e => {
    reconnectCallback(e);
  });

  socketInstance.on('connect_error', e => {
    console.log(e.message);
    disconnectCallback(e);
    console.log('socket connect_error event :: force new connect');
  });

  socketInstance.on('connect_timeout', e => {
    disconnectCallback(e);
    console.log('socket connect_timeout event :: force new connect');
  });

  socketInstance.on('message', data => {
    if (data.result === 'success') {
      console.log('token auth :: success');

      connectCallback(data);

      for (let [key, value] of Object.entries(events)) {
        if (socketInstance.hasListeners(key)) socketInstance.off(key);
        socketInstance.on(key, value);
      }
    } else {
      console.log('token auth :: fail');
      // token 인증 실패
      // TODO: 처리 필요
    }
  });

  socketInstance.on('error', data => {
    console.log(data);
    console.log('socket error event :: force new connect');
  });

  return socketInstance;
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const WaitForSocketConnection = async () => {
  let dropCount = 0;
  return new Promise(async (resolve, reject) => {
    while (!socketInstance) {
      dropCount++;
      if (dropCount > 15) {
        reject('[ERROR-socketConnect] socketInstance null point exception');
      }
      await sleep(250);
    }
    dropCount = 0;
    while (socketInstance.disconnected) {
      dropCount++;
      if (dropCount > 15) {
        reject('[ERROR-socketConnect] network timeout error');
      }
      await sleep(250);
    }
    resolve(true);
  });
};

export const closeSocket = logout => {
  if (socketInstance) {
    const connection = socketInstance;
    if (!connection.disconnected) {
      if (logout) {
        // logout시 disconnect option 해제
        if (connection.hasListeners('disconnect')) connection.off('disconnect');
      }
      connection.close();
    }
    socketInstance = null;
  }
};
