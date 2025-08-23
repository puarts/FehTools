set EMSDK_ROOT=F:\trunk\Programs\Externals\emsdk-master
call %EMSDK_ROOT%\emsdk activate latest

call %EMSDK_ROOT%\emsdk_env.bat

echo compiling...
set FIXED_OPTION=%~dp0FehSummonSimulatorLibrary\WasmInterface.cpp -s WASM=1 -s "MODULARIZE=1" -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" -s "DEMANGLE_SUPPORT=1" -o %~dp0WasmInterface.js
set PTHREAD_OPTION=-pthread -Wpthreads-mem-growth -s ASYNCIFY
set PTHREAD_OPTION= 
emcc -O3 --closure 0  -s ALLOW_MEMORY_GROWTH=1  -s TOTAL_MEMORY=16MB  %FIXED_OPTION% %PTHREAD_OPTION%
@REM emcc -Oz --closure 1 -s ALLOW_MEMORY_GROWTH=1 %FIXED_OPTION%

@REM rem emcc -O3  -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=2 -o %~dp0PthreadTest.js %~dp0PthreadTest.c

pause