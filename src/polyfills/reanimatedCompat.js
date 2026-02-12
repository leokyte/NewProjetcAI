"use strict"

const ReanimatedModule = require('react-native-reanimated')

// Reanimated 4 dropped `useAnimatedGestureHandler`, but some downstream deps (e.g. React Navigation Drawer)
// still reach for it. Recreate the old helper using the current hook primitives when it is missing.
if (typeof ReanimatedModule.useAnimatedGestureHandler !== 'function') {
	// Defensive check: ensure useHandler and useEvent exist before destructuring
	if (
		typeof ReanimatedModule.useHandler !== 'function' ||
		typeof ReanimatedModule.useEvent !== 'function'
	) {
		// Log error for debugging
		if (__DEV__) {
			console.warn(
				'[reanimatedCompat] useHandler or useEvent not available in react-native-reanimated. ' +
				'Skipping useAnimatedGestureHandler polyfill. ' +
				'This may indicate incomplete Reanimated initialization.'
			)
		}

		// Exit early without creating the polyfill
		module.exports = {}
	} else {
		const { useHandler, useEvent } = ReanimatedModule

		const EVENT_TYPE = {
			UNDETERMINED: 0,
			FAILED: 1,
			BEGAN: 2,
			CANCELLED: 3,
			ACTIVE: 4,
			END: 5,
		}

		ReanimatedModule.useAnimatedGestureHandler = function useAnimatedGestureHandler(
			handlers,
			dependencies
		) {
			const { context, doDependenciesDiffer, useWeb } = useHandler(handlers, dependencies)

			const handler = (event) => {
				'worklet'

				const nativeEvent = {
					...(event?.nativeEvent ?? {}),
					...(event ?? {}),
				}

				const payload = useWeb ? nativeEvent : event

				if (payload.state === EVENT_TYPE.BEGAN && typeof handlers.onStart === 'function') {
					handlers.onStart(payload, context)
				}
				if (payload.state === EVENT_TYPE.ACTIVE && typeof handlers.onActive === 'function') {
					handlers.onActive(payload, context)
				}
				if (
					payload.oldState === EVENT_TYPE.ACTIVE &&
					payload.state === EVENT_TYPE.END &&
					typeof handlers.onEnd === 'function'
				) {
					handlers.onEnd(payload, context)
				}
				if (
					payload.oldState === EVENT_TYPE.BEGAN &&
					payload.state === EVENT_TYPE.FAILED &&
					typeof handlers.onFail === 'function'
				) {
					handlers.onFail(payload, context)
				}
				if (
					payload.oldState === EVENT_TYPE.ACTIVE &&
					payload.state === EVENT_TYPE.CANCELLED &&
					typeof handlers.onCancel === 'function'
				) {
					handlers.onCancel(payload, context)
				}
				if (
					(payload.oldState === EVENT_TYPE.BEGAN || payload.oldState === EVENT_TYPE.ACTIVE) &&
					payload.state !== EVENT_TYPE.BEGAN &&
					payload.state !== EVENT_TYPE.ACTIVE &&
					typeof handlers.onFinish === 'function'
				) {
					handlers.onFinish(
						payload,
						context,
						payload.state === EVENT_TYPE.CANCELLED || payload.state === EVENT_TYPE.FAILED
					)
				}
			}

			if (useWeb) {
				return handler
			}

			return useEvent(handler, ['onGestureHandlerStateChange', 'onGestureHandlerEvent'], doDependenciesDiffer)
		}

		module.exports = {}
	}
}
