#include <pthread.h>
#include <stdio.h>
#include <emscripten.h>

// Calculate Fibonacci numbers shared function
int fibonacci(int iterations)
{
    int val = 1;
    int last = 0;

    if (iterations == 0)
    {
        return 0;
    }
    for (int i = 1; i < iterations; i++)
    {
        int seq;

        seq = val + last;
        last = val;
        val = seq;
    }
    return val;
}
// Start function for the background thread
void *bg_func(void *arg)
{
    int *iter = (void *)arg;

    *iter = fibonacci(*iter);
    return arg;
}

// start_timer(): call JS to set an async timer for 500ms
EM_JS(void, start_timer, (), {
    Module.timer = false;
    setTimeout(
        function() {
            Module.timer = true;
        },
        500);
});

// check_timer(): check if that timer occurred
EM_JS(bool, check_timer, (), {
    return Module.timer;
});

// Foreground thread and main entry point
int main(int argc, char *argv[])
{
    int fg_val = 54;
    int bg_val = 42;
    pthread_t bg_thread;

    // Create the background thread
    if (pthread_create(&bg_thread, NULL, bg_func, &bg_val))
    {
        perror("Thread create failed");
        return 1;
    }
    // Calculate on the foreground thread
    fg_val = fibonacci(fg_val);
    // Wait for background thread to finish
    if (pthread_join(bg_thread, NULL))
    {
        perror("Thread join failed");
        return 2;
    }
    // Show the result from background and foreground threads
    printf("Fib(42) is %d, Fib(6 * 9) is %d\n", bg_val, fg_val);

    return 0;
}