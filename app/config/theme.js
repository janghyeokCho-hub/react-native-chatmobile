import { getSetting, getConfig } from '@/config';
import { DefaultTheme } from '@react-navigation/native';

const getThemeColor = theme => {
  let color = '#12cfee'; // blue color
  const themeLists = getConfig('ClientThemeList');
  if (themeLists) {
    const findItem = themeLists.find(item => item.name === theme);
    if (findItem) color = findItem.value;
  }
  return color;
};

const getFontSizeIncVal = fontSize => {
  if (fontSize === 's') return -2;
  if (fontSize === 'm') return 0;
  if (fontSize === 'l') return 3;
};

const getTheme = () => {
  const theme = getSetting('theme', 'blue');
  const fontSize = getSetting('fontSize', 'm');

  const incVal = getFontSizeIncVal(fontSize);

  return {
    ...DefaultTheme,
    colors: {
      card: '#fff',
      border: '#d9d9d9',
      text: '#000',
      background: '#fff',
      primary: getThemeColor(theme),
    },
    sizes: {
      small: 12 + incVal,
      default: 14 + incVal,
      large: 17 + incVal,
      chat: 13 + incVal,
      inc: incVal,
    },
  };
};

export default getTheme;
