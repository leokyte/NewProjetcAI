#include <RNCConfigSpec.h>

namespace facebook::react {

static facebook::jsi::Value __hostFunction_NativeConfigModuleSpecJSI_getConfig(
    facebook::jsi::Runtime &rt,
    TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
  static jmethodID cachedMethodId = nullptr;
  return static_cast<JavaTurboModule &>(turboModule)
      .invokeJavaMethod(
          rt,
          ObjectKind,
          "getConfig",
          "()Lcom/facebook/react/bridge/WritableMap;",
          args,
          count,
          cachedMethodId);
}

NativeConfigModuleSpecJSI::NativeConfigModuleSpecJSI(
    const JavaTurboModule::InitParams &params)
    : JavaTurboModule(params) {
  methodMap_["getConfig"] =
      MethodMetadata{0, __hostFunction_NativeConfigModuleSpecJSI_getConfig};
}

std::shared_ptr<TurboModule> RNCConfigSpec_ModuleProvider(
    const std::string &moduleName,
    const JavaTurboModule::InitParams &params) {
  if (moduleName == "RNCConfigModule") {
    return std::make_shared<NativeConfigModuleSpecJSI>(params);
  }
  return nullptr;
}

} // namespace facebook::react
