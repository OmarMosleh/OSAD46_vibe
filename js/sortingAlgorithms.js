/*
 * Sorting Algorithms Module
 * 
 * This file contains implementations of various sorting algorithms.
 * Each algorithm is a generator function that yields operations (comparisons/swaps)
 * so the visualizer can animate them step by step.
 * 
 * Why generators? Because they let us pause and resume execution,
 * perfect for creating smooth animations!
 */

/**
 * Bubble Sort - The classic! Compare adjacent elements and swap if needed.
 * Like bubbles rising to the surface, larger elements "bubble up" to the end.
 * 
 * Time Complexity: O(n²) - not the fastest, but easy to understand
 * Space Complexity: O(1) - sorts in place
 */
function* bubbleSort(array) {
    const arr = [...array]; // Make a copy so we don't mess up the original
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            yield { type: 'compare', indices: [j, j + 1] };

            if (arr[j] > arr[j + 1]) {
                // Swap if they're in the wrong order
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                yield { type: 'swap', indices: [j, j + 1], array: [...arr] };
            }
        }
        // Mark the last element as sorted (it bubbled to its final position)
        yield { type: 'sorted', indices: [n - i - 1] };
    }

    // Don't forget the first element - it's sorted too!
    yield { type: 'sorted', indices: [0] };
    yield { type: 'done', array: arr };
}

/**
 * Selection Sort - Find the minimum element and put it at the beginning.
 * Repeat for the rest of the array. Simple and elegant!
 * 
 * Time Complexity: O(n²) - same as bubble sort
 * Space Complexity: O(1) - sorts in place
 */
function* selectionSort(array) {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;

        // Find the minimum element in the unsorted portion
        for (let j = i + 1; j < n; j++) {
            yield { type: 'compare', indices: [minIndex, j] };

            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        // Swap the minimum element with the first unsorted element
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            yield { type: 'swap', indices: [i, minIndex], array: [...arr] };
        }

        // Mark this position as sorted
        yield { type: 'sorted', indices: [i] };
    }

    // Last element is sorted by default
    yield { type: 'sorted', indices: [n - 1] };
    yield { type: 'done', array: arr };
}

/**
 * Insertion Sort - Build the sorted array one element at a time.
 * Like sorting playing cards in your hand - pick a card and insert it
 * in the right position among the already sorted cards.
 * 
 * Time Complexity: O(n²) worst case, O(n) best case (already sorted)
 * Space Complexity: O(1) - sorts in place
 */
function* insertionSort(array) {
    const arr = [...array];
    const n = arr.length;

    // First element is considered sorted
    yield { type: 'sorted', indices: [0] };

    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;

        // Move elements greater than key one position ahead
        while (j >= 0) {
            yield { type: 'compare', indices: [j, j + 1] };

            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                yield { type: 'swap', indices: [j, j + 1], array: [...arr] };
                j--;
            } else {
                break;
            }
        }

        arr[j + 1] = key;
        yield { type: 'sorted', indices: [i] };
    }

    yield { type: 'done', array: arr };
}

/**
 * Merge Sort - Divide and conquer! Split the array in half, sort each half,
 * then merge them back together. Recursive and efficient!
 * 
 * Time Complexity: O(n log n) - much better than O(n²)!
 * Space Complexity: O(n) - needs extra space for merging
 */
function* mergeSort(array) {
    const arr = [...array];
    
    // Helper generator for the merge operation
    function* merge(arr, left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;

        // Merge the two sorted halves
        while (i < leftArr.length && j < rightArr.length) {
            yield { type: 'compare', indices: [left + i, mid + 1 + j] };

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            yield { type: 'swap', indices: [k], array: [...arr] };
            k++;
        }

        // Copy remaining elements from left half
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            yield { type: 'swap', indices: [k], array: [...arr] };
            i++;
            k++;
        }

        // Copy remaining elements from right half
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            yield { type: 'swap', indices: [k], array: [...arr] };
            j++;
            k++;
        }
    }

    // Recursive merge sort helper
    function* mergeSortHelper(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);

            // Sort left half
            yield* mergeSortHelper(arr, left, mid);
            // Sort right half
            yield* mergeSortHelper(arr, mid + 1, right);
            // Merge the sorted halves
            yield* merge(arr, left, mid, right);

            // Mark sorted section
            for (let i = left; i <= right; i++) {
                yield { type: 'sorted', indices: [i] };
            }
        }
    }

    yield* mergeSortHelper(arr, 0, arr.length - 1);
    yield { type: 'done', array: arr };
}

/**
 * Quick Sort - Another divide and conquer algorithm!
 * Pick a pivot, partition the array around it, then recursively sort.
 * Fast and popular in practice!
 * 
 * Time Complexity: O(n log n) average, O(n²) worst case
 * Space Complexity: O(log n) for recursion stack
 */
function* quickSort(array) {
    const arr = [...array];

    // Partition helper - puts pivot in its correct position
    function* partition(arr, low, high) {
        const pivot = arr[high]; // Choose last element as pivot
        let i = low - 1;

        for (let j = low; j < high; j++) {
            yield { type: 'compare', indices: [j, high] };

            if (arr[j] < pivot) {
                i++;
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    yield { type: 'swap', indices: [i, j], array: [...arr] };
                }
            }
        }

        // Place pivot in its correct position
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        if (i + 1 !== high) {
            yield { type: 'swap', indices: [i + 1, high], array: [...arr] };
        }

        return i + 1;
    }

    // Recursive quick sort helper
    function* quickSortHelper(arr, low, high) {
        if (low < high) {
            // Partition and get pivot index
            const pivotGen = partition(arr, low, high);
            let pivotResult = pivotGen.next();
            
            while (!pivotResult.done) {
                yield pivotResult.value;
                pivotResult = pivotGen.next();
            }
            
            const pivotIndex = pivotResult.value;
            yield { type: 'sorted', indices: [pivotIndex] };

            // Recursively sort elements before and after partition
            yield* quickSortHelper(arr, low, pivotIndex - 1);
            yield* quickSortHelper(arr, pivotIndex + 1, high);
        } else if (low === high) {
            // Single element is sorted
            yield { type: 'sorted', indices: [low] };
        }
    }

    yield* quickSortHelper(arr, 0, arr.length - 1);
    yield { type: 'done', array: arr };
}

/**
 * Heap Sort - Use a binary heap data structure to sort!
 * Build a max heap, then repeatedly extract the maximum element.
 * Efficient and doesn't need extra space!
 * 
 * Time Complexity: O(n log n)
 * Space Complexity: O(1) - sorts in place
 */
function* heapSort(array) {
    const arr = [...array];
    const n = arr.length;

    // Helper to maintain heap property
    function* heapify(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        // Check if left child is larger than root
        if (left < n) {
            yield { type: 'compare', indices: [left, largest] };
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }

        // Check if right child is larger than largest so far
        if (right < n) {
            yield { type: 'compare', indices: [right, largest] };
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }

        // If largest is not root, swap and continue heapifying
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            yield { type: 'swap', indices: [i, largest], array: [...arr] };
            yield* heapify(arr, n, largest);
        }
    }

    // Build max heap - rearrange array into heap structure
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapify(arr, n, i);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        // Move current root (maximum) to end
        [arr[0], arr[i]] = [arr[i], arr[0]];
        yield { type: 'swap', indices: [0, i], array: [...arr] };
        yield { type: 'sorted', indices: [i] };

        // Heapify the reduced heap
        yield* heapify(arr, i, 0);
    }

    yield { type: 'sorted', indices: [0] };
    yield { type: 'done', array: arr };
}

// Export all sorting algorithms so other modules can use them
// In the browser, these become global functions