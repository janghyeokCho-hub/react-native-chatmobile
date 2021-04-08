let openRoomList = null;

class RoomList {
  constructor(roomArr) {
    if (roomArr) this.openRoomList = roomArr;
    else this.openRoomList = [];
  }

  getData = () => {
    return this.openRoomList;
  };

  push = object => {
    this.openRoomList.push(object);
  };

  find = object => {
    return this.openRoomList.find(object);
  };

  remove = roomId => {
    return this.openRoomList.splice(
      this.openRoomList.findIndex(r => r == roomId),
      1,
    );
  };
}

export const getRoomList = () => {
  if (!openRoomList) openRoomList = new RoomList();
  return openRoomList;
};

export const isNoRoomID = roomId => {
  if (openRoomList) {
    return openRoomList.find(item => item == roomId) == undefined;
  } else {
    getRoomList();
    return true;
  }
};

export const clearData = () => {
  if (openRoomList) openRoomList = null;
};
