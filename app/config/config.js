const Config = {
  /*ServerURL: {
    HOST: 'http://192.168.11.80',
    CHAT: 'http://192.168.11.80/server',
    MANAGE: 'http://192.168.11.80/restful',
    MANAGER: 'http://192.168.11.80/manager',
    EVENT: 'http://192.168.11.80',
  },*/
  ServerURL: {
    HOST: 'https://eum.covision.co.kr',
    CHAT: 'https://eum.covision.co.kr/server',
    MANAGE: 'https://eum.covision.co.kr/restful',
    MANAGER: 'https://eum.covision.co.kr/manager',
    EVENT: 'https://eum.covision.co.kr',
  },

  Cypto: {
    KeySize: '128',
    IterationCount: '1000',
    Salt: '18b00b2fc5f0e0ee40447bba4dabc952',
    Iv: '4378110db6392f93e95d5159dabdee9b',
    PassPhrase: 'cmsp',
  },
  System: {
    presence: [
      {
        code: 'online',
        class: 'online',
        name: '온라인',
        mobileStyle: {
          backgroundColor: '#7ED321',
        },
      },
      {
        code: 'busy',
        class: 'busy',
        name: '다른용무중',
        mobileStyle: {
          backgroundColor: '#E9A7F5',
        },
      },
      {
        code: 'doNotDisturb',
        class: 'doNotDisturb',
        name: '방해금지',
        mobileStyle: {
          backgroundColor: '#FC7350',
        },
      },
      {
        code: 'beRightBack',
        class: 'beRightBack',
        name: '곧돌아오겠음',
        mobileStyle: {
          backgroundColor: '#FDCF2F',
        },
      },
      {
        code: 'offWork',
        class: 'offWork',
        name: '퇴근',
        mobileStyle: {
          backgroundColor: '#A5BADF',
        },
      },
      {
        code: 'away',
        class: 'away',
        name: '자리비움',
        mobileStyle: {
          backgroundColor: '#FFFFFF',
          borderSize: 1,
          borderColor: '#C7CFD1',
        },
      },
    ],
    ImagePickerOption: {
      title: 'Select Avatar',
    },
    File: {
      limitFileCnt: 5,
      limitUnitFileSize: 5242880 * 2, // 10MB
      limitExtension: [
        'gif',
        'jpg',
        'jpeg',
        'tif',
        'tiff',
        'png',
        'bmp',
        'zip',
        'ppt',
        'pptx',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'hwp',
        'hwpx',
        'gzip',
        'txt',
        'csv',
        'ico',
        '7z',
        'ppdf',
      ],
    },
  },
};

export default Config;
