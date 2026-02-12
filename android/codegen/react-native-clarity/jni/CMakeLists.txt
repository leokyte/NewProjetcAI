cmake_minimum_required(VERSION 3.13)

add_library(react_codegen_Clarity SHARED Clarity.cpp)

target_include_directories(
  react_codegen_Clarity
  PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}
         "${REACT_NATIVE_DIR}/ReactCommon")

target_link_libraries(
  react_codegen_Clarity
  fbjni
  ReactAndroid::jsi
  ReactAndroid::reactnative)

target_compile_reactnative_options(react_codegen_Clarity PRIVATE)
