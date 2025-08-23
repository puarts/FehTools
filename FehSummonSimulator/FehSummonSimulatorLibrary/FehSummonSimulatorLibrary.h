// 以下の ifdef ブロックは、DLL からのエクスポートを容易にするマクロを作成するための
// 一般的な方法です。この DLL 内のすべてのファイルは、コマンド ラインで定義された FEHSUMMONSIMULATORLIBRARY_EXPORTS
// シンボルを使用してコンパイルされます。このシンボルは、この DLL を使用するプロジェクトでは定義できません。
// ソースファイルがこのファイルを含んでいる他のプロジェクトは、
// FEHSUMMONSIMULATORLIBRARY_API 関数を DLL からインポートされたと見なすのに対し、この DLL は、このマクロで定義された
// シンボルをエクスポートされたと見なします。
#ifdef FEHSUMMONSIMULATORLIBRARY_EXPORTS
#define FEHSUMMONSIMULATORLIBRARY_API __declspec(dllexport)
#elif defined FEHSUMMONSIMULATORLIBRARY_EMPTY
#define FEHSUMMONSIMULATORLIBRARY_API
#else
#define FEHSUMMONSIMULATORLIBRARY_API __declspec(dllimport)
#endif

