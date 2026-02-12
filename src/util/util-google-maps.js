import axios from 'axios';

const axiosAPI = axios.create({
  baseURL: 'https://geocode.search.hereapi.com',
  timeout: 10000,
});
const apiKey = 'u8KLhr-khSS8aYdnYx4-73NR5thOZGWmbYR-oB1jPuY';
export const autocompleteAddress = (text, lang = 'pt-BR') => axiosAPI.get('v1/geocode', {  params: { apiKey, q: text, lang } });
