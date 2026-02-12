import { xor } from './';

const formatAddress = (address, addressComplement) => {
  if (!address) return null;
  return addressComplement ? `${address} - ${addressComplement}` : address;
};


export const formatStoreInformation = (address, addressComplement, phone, extra) => {
  if (!phone && !address && !extra) return '';

  // Declare phrase
  let phrase = [];

  // set store address
  const storeAddress = formatAddress(address, addressComplement) || '';
  if (storeAddress) phrase.push(storeAddress.trim());

  // set store phone
  if (phone) phrase.push(phone);

  // set extra
  if (extra) phrase.push(extra);

  return phrase.join(' ● ');
};

export const formatCustomerInformation = (address, addressComplement, phone) => {
  if (!phone && !address) return '';

  const customerAddress = formatAddress(address, addressComplement) || '';
  if (!phone) return customerAddress;

  return customerAddress ? `${phone} ● ${customerAddress}` : phone;
};

export const formatHeaderLabel = (phone, complement = '') => {
  if (!phone || !complement) return '';
  return xor(phone, complement.trim().length) ? (phone || complement) : `${phone} ● ${complement}`;
};
