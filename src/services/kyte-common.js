import axios from 'axios'
import Config from 'react-native-config'
const { IP_API_KEY, IP_API_URL } = Config

export const ipAPI = axios.create({
	baseURL: IP_API_URL,
})

export const getGeoLocation = async () => {
	const URL = `/json?key=${IP_API_KEY}`
	const { data } = await ipAPI.post(URL)

	return data
}
