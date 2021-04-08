let notReadList = null;

class NotReadList {
  constructor(notReadArrs) {
    if (notReadArrs) this.notReadList = notReadArrs;
    else this.notReadList = [];
  }

  getData = () => {
    return this.notReadList;
  };

  push = object => {
    this.notReadList.push(object);
  };
}

export const getNotReadList = () => {
  if (!notReadList) notReadList = new NotReadList();

  return notReadList;
};

export const setData = notReadArrs => {
  notReadList = new NotReadList(notReadArrs);
};

export const clearData = () => {
  if (notReadList) notReadList = null;
};
