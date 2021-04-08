export const getFixedUserData = param => {
  let users = {};

  param.array.forEach(item => {
    if (item[param.key])
      users = item[param.key].reduce((acc, current) => {
        acc[current.id] = current.presence;
        return acc;
      }, users);
  });

  return users;
};
