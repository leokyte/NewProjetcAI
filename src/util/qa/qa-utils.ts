import { Platform } from 'react-native'

export interface TestID {
	accessible?: boolean
	accessibilityLabel?: string
	testID?: string
}

export const generateTestID = (testID: string): TestID =>
	Platform.OS === 'android' ? { testID, accessibilityLabel: testID } : { testID }
