## iOS Pod Build-Type Audit

Pods that **must** be packaged as static frameworks:

- RNFBApp
- RNFBAnalytics
- RNFBAuth
- RNFBCrashlytics
- RNFBFirestore
- RNFBPerf
- RNFBRemoteConfig
- RNFBStorage
- RNAppleAuthentication
- react-native-appsflyer
- react-native-onesignal

Pods that **must remain** static libraries (or provide their own vendored artifacts):

- hermes-engine / React-hermes / ReactCommon*
- RealmJS (needs `realm-combined.a`)
- gRPC-Core, gRPC-C++, BoringSSL-GRPC
- React Native core subspecs (React-Core, Fabric, TurboModules, etc.)
- Nitro modules, RNReanimated, and any pods that link directly against Hermes/JSI

> \* Includes all dependent subspecs such as `React-runtimeexecutor`, `React_renderer*`, and other Hermes/JSI consumers.

These lists drive the new selective framework opt-in implemented in the Podfile.
