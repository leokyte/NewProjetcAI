cmake_minimum_required(VERSION 3.13)

add_library(react_codegen_RNCConfigSpec SHARED RNCConfigSpec.cpp)

# RNConfig ships its codegen headers inside node_modules; expose them so anything
# that links to react_codegen_RNCConfigSpec (e.g. the autolinking glue) can include
# <RNCConfigSpec.h> without manually wiring search paths.
get_filename_component(RN_CONFIG_REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../../" ABSOLUTE)
set(RN_CONFIG_CODEGEN_DIR
    "${RN_CONFIG_REPO_ROOT}/node_modules/react-native-config/android/build/generated/source/codegen/jni")

target_include_directories(
  react_codegen_RNCConfigSpec
  PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}
         "${REACT_NATIVE_DIR}/ReactCommon"
         ${RN_CONFIG_CODEGEN_DIR})

target_link_libraries(
  react_codegen_RNCConfigSpec
  fbjni
  ReactAndroid::jsi
  ReactAndroid::reactnative)

target_compile_reactnative_options(react_codegen_RNCConfigSpec PRIVATE)

# Backwards compatibility for builds that still link against the old target name.
add_library(react_codegen_RNCConfigModule ALIAS react_codegen_RNCConfigSpec)
