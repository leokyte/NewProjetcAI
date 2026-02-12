import { useState, useCallback, useRef, useEffect } from 'react';
import {
	createSound,
	AudioEncoderAndroidType,
	AudioSourceAndroidType,
	AVEncodingOption,
	AVEncoderAudioQualityIOSType,
	type AudioSet,
} from 'react-native-nitro-sound';
import RNFetchBlob from 'rn-fetch-blob';
import Config from 'react-native-config';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import KyteMixpanel from '../integrations/Mixpanel';

interface UseAudioRecorderOptions {
	onTranscriptionComplete: (text: string) => void;
	onError?: (error: Error) => void;
	onPermissionDenied?: () => void;
	onPermissionGranted?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'processing';

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-1';
const AUDIO_LANGUAGE = 'pt';
const AUDIO_PERMISSION = Platform.select({
	ios: PERMISSIONS.IOS.MICROPHONE,
	android: PERMISSIONS.ANDROID.RECORD_AUDIO,
});

const AUDIO_RECORDING_SETTINGS: AudioSet = {
	AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
	AudioSourceAndroid: AudioSourceAndroidType.MIC,
	AudioSamplingRate: 16000, // 16kHz for speech
	AudioChannels: 1, // mono
	AudioEncodingBitRate: 32000, // 32kbps
	AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.low, // low, medium, high - use low for faster upload
	AVNumberOfChannelsKeyIOS: 1, // mono instead of stereo
	AVFormatIDKeyIOS: 'aac', // AAC compression
	AVSampleRateKeyIOS: 16000, // 16kHz is enough for speech (Whisper recommends this)
  
};

export const useAudioRecorder = ({
	onTranscriptionComplete,
	onError,
	onPermissionDenied,
	onPermissionGranted,
}: UseAudioRecorderOptions) => {
	const [recordingState, setRecordingState] = useState<RecordingState>('idle');
	const [isPermissionDenied, setIsPermissionDenied] = useState(false);
	const audioFilePathRef = useRef<string | null>(null);
	const sound = useRef(createSound()).current;

	// Add event listener to prevent warning
	useEffect(() => {
		sound.addRecordBackListener(() => {
			// Silently consume the event to prevent warning
		});

		return () => {
			sound.removeRecordBackListener();
			sound.dispose();
		};
	}, [sound]);

	const cleanupAudioFile = useCallback(async () => {
		if (audioFilePathRef.current) {
			try {
				await RNFetchBlob.fs.unlink(audioFilePathRef.current);
			} catch (error) {
				console.warn('Failed to cleanup audio file:', error);
			}
			audioFilePathRef.current = null;
		}
	}, []);

	const normalizeFilePath = (path: string): string => {
		return path.startsWith('file://') ? path.replace('file://', '') : path;
	};

	const transcribeAudio = useCallback(
		async (filePath: string): Promise<string | null> => {
			const cleanPath = normalizeFilePath(filePath);

			const response = await RNFetchBlob.fetch(
				'POST',
				OPENAI_API_URL,
				{
					Authorization: `Bearer ${
						Config.AUDIO_TRANSCRIPTION_OPENAI_API_KEY || Config.OPENAI_API_KEY
					}`,
					'Content-Type': 'multipart/form-data',
				},
				[
					{
						name: 'file',
						filename: 'audio.m4a',
						type: 'audio/m4a',
						data: RNFetchBlob.wrap(cleanPath),
					},
					{ name: 'model', data: WHISPER_MODEL },
					{ name: 'language', data: AUDIO_LANGUAGE },
					{ name: 'response_format', data: 'json' },
				]
			);

			const transcription = response.json();

			if (transcription.error) {
				throw new Error(
					`OpenAI API error: ${transcription.error.message || JSON.stringify(transcription.error)}`
				);
			}

			const hasValidText = transcription.text?.trim();
			if (!hasValidText) {
				console.warn('Empty transcription received');
				return null;
			}

			return transcription.text;
		},
		[]
	);

	const handlePermissionBlocked = useCallback(() => {
		setRecordingState('idle');
		setIsPermissionDenied(true);
		onPermissionDenied?.();
	}, [onPermissionDenied]);

	const ensureAudioPermission = useCallback(async (): Promise<boolean> => {
		// Android: use PermissionsAndroid to avoid activity null issues
		if (Platform.OS === 'android') {
			try {
				const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
				const hasPermission = await PermissionsAndroid.check(permission);

				if (!hasPermission) {
					const status = await PermissionsAndroid.request(permission);

					if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
						handlePermissionBlocked();
						return false;
					}

					if (status !== PermissionsAndroid.RESULTS.GRANTED) {
						setRecordingState('idle');
						return false;
					}
					onPermissionGranted?.();
				} else {
					onPermissionGranted?.();
				}

				setIsPermissionDenied(false);
				return true;
			} catch (error) {
				console.warn('Failed to request RECORD_AUDIO permission (Android)', error);
				onError?.(error as Error);
				return false;
			}
		}

		if (!AUDIO_PERMISSION) {
			onError?.(new Error('Audio permission not available on this platform'));
			return false;
		}

		try {
			let status = await check(AUDIO_PERMISSION);

			if (status === RESULTS.BLOCKED) {
				handlePermissionBlocked();
				return false;
			}

			if (status !== RESULTS.GRANTED) {
				status = await request(AUDIO_PERMISSION);

				if (status === RESULTS.BLOCKED) {
					handlePermissionBlocked();
					return false;
				}

				if (status !== RESULTS.GRANTED) {
					setRecordingState('idle');
					return false;
				}
				onPermissionGranted?.();
			} else {
				onPermissionGranted?.();
			}

			setIsPermissionDenied(false);
			return true;
		} catch (error) {
			console.warn('Failed to request RECORD_AUDIO permission', error);
			onError?.(error as Error);
			return false;
		}
	}, [handlePermissionBlocked, onError, onPermissionGranted]);

	const startRecording = useCallback(async () => {
		if (recordingState !== 'idle') {
			return;
		}

		KyteMixpanel.track('Smart AI Assistant Audio Record');
		try {
			const hasPermission = await ensureAudioPermission();
			if (!hasPermission) {
				return;
			}

			const filePath = await sound.startRecorder(undefined, AUDIO_RECORDING_SETTINGS, true);
			audioFilePathRef.current = filePath;
			setRecordingState('recording');
		} catch (error) {
			console.error('Failed to start recording:', error);
			setRecordingState('idle');
			onError?.(error as Error);
		}
	}, [ensureAudioPermission, onError, recordingState, sound]);

	const confirmRecording = useCallback(async () => {
		setRecordingState('processing');
		KyteMixpanel.track('Smart AI Assistant Audio Send');

		try {
			await sound.stopRecorder();

			const filePath = audioFilePathRef.current;
			if (!filePath) {
				throw new Error('No audio file recorded');
			}

			const transcribedText = await transcribeAudio(filePath);
			if (transcribedText) {
				onTranscriptionComplete(transcribedText);
			}
		} catch (error) {
			console.error('Error confirming recording:', error);
			onError?.(error as Error);
		} finally {
			await cleanupAudioFile();
			setRecordingState('idle');
		}
	}, [sound, transcribeAudio, cleanupAudioFile, onTranscriptionComplete, onError]);

	const cancelRecording = useCallback(async () => {
		KyteMixpanel.track('Smart AI Assistant Audio Cancel');

		try {
			await sound.stopRecorder();
			await cleanupAudioFile();
			setRecordingState('idle');
		} catch (error) {
			console.error('Error canceling recording:', error);
			onError?.(error as Error);
		}
	}, [sound, cleanupAudioFile, onError]);

	// Cleanup on unmount to prevent orphaned files if app crashes or component unmounts during recording
	useEffect(() => {
		return () => {
			if (audioFilePathRef.current) {
				RNFetchBlob.fs.unlink(audioFilePathRef.current).catch(() => {
					// Silently fail if file doesn't exist
				});
			}
		};
	}, []);

	return {
		startRecording,
		confirmRecording,
		cancelRecording,
		isRecording: recordingState === 'recording',
		isProcessing: recordingState === 'processing',
		recordingState,
		isPermissionDenied,
		setIsPermissionDenied,
	};
};
