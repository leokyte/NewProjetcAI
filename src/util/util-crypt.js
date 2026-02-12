const CryptoJS = require('crypto-js');

const SALT = 'Kyte-CrypT-keY';

export const encrypt = (value) => {
  const hash = CryptoJS.SHA512(value, SALT);
  const valueHash = CryptoJS.enc.Base64.stringify(hash);
  return valueHash;
};

export const compare = (shaString, cleanString) => {
  const hash = CryptoJS.SHA512(cleanString, SALT);
  const valueHash = CryptoJS.enc.Base64.stringify(hash);

  return (shaString === valueHash);
};

export const generateRandomString = (n, r = '') => {
  while (n--) r += String.fromCharCode((r = Math.random() * 62 | 0, r += r > 9 ? (r < 36 ? 55 : 61) : 48));
  return r;
};

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const Base64 = {
  encode: (input: string = '') => {
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3 / 4);

      if (charCode > 0xFF) {
        throw new Error("'encode' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }

      block = block << 8 | charCode;
    }

    return output;
  },

  decode: (input: string = '') => {
    let str = input.replace(/[=]+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'decode' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  },
};

export const hashHMAC256 = ({ data, key = 'app_secret' }) =>
  CryptoJS.HMAC(data, key);
