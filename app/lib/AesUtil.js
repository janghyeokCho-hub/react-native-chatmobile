import CryptoJS from 'crypto-js';
import { getConfig } from '@/config';

let instance;

class AesUtil {
  constructor(keySize, iterationCount, salt, iv, passPhrase) {
    if (instance) return instance;
    this.keySize = keySize / 32;
    this.iterationCount = iterationCount;
    this.salt = salt;
    this.iv = iv;
    this.passPhrase = passPhrase;
    instance = this;
  }

  generateKey = () => {
    const key = CryptoJS.PBKDF2(
      this.passPhrase,
      CryptoJS.enc.Hex.parse(this.salt),
      {
        keySize: this.keySize,
        iterations: this.iterationCount,
      },
    );
    return key;
  };

  encrypt = plainText => {
    const key = this.generateKey(this.salt, this.passPhrase);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(this.iv),
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  };

  decrypt = cipherText => {
    const key = this.generateKey(this.salt, this.passPhrase);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherText),
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: CryptoJS.enc.Hex.parse(this.iv),
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  };
}

// singleton
export const getAesUtil = () => {
  const {
    KeySize: KEY_SIZE,
    IterationCount: ITERATION_COUNT,
    Salt: SALT,
    Iv: IV,
    PassPhrase: PASS_PHRASE,
  } = getConfig('Crypto');

  return new AesUtil(KEY_SIZE, ITERATION_COUNT, SALT, IV, PASS_PHRASE);
};
