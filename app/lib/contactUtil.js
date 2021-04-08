import { addContacts, deleteContacts } from '@/modules/contact';
import { addFixedUsers } from '@/modules/presence';

export const addFavorite = (dispatch, userInfo, orgFolderType) => {
  dispatch(
    addContacts([
      {
        targetId: userInfo.id,
        targetType: userInfo.type,
        companyCode: null,
        folderType: 'F',
        orgFolderType: orgFolderType,
        userInfo: userInfo,
      },
    ]),
  );

  if (orgFolderType != 'C' && userInfo.type == 'U')
    dispatch(addFixedUsers([{ id: userInfo.id, presence: userInfo.presence }]));
};

export const addContact = (dispatch, userInfo) => {
  dispatch(
    addContacts([
      {
        targetId: userInfo.id,
        targetType: userInfo.type,
        companyCode: userInfo.companyCode,
        folderType: userInfo.type == 'G' ? 'G' : 'C',
        userInfo: userInfo,
      },
    ]),
  );

  if (userInfo.type == 'U')
    dispatch(addFixedUsers([{ id: userInfo.id, presence: userInfo.presence }]));
};

export const addContactList = (dispatch, list) => {
  dispatch(addContacts(list));

  const presenceList = list.filter(item => {
    if (item.targetType == 'U')
      return { id: item.targetId, presence: item.presence };
  });

  dispatch(addFixedUsers(presenceList));
};

export const deleteContact = (dispatch, id, folderID, folderType) => {
  let params = {
    folderType: folderType,
  };

  if (id != null) params.contactId = id;
  if (folderID != null) params.folderId = folderID;

  dispatch(deleteContacts(params));
};
