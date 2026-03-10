/*
 * Main Application Module
 * 
 * This is the conductor of our sorting symphony! It ties together
 * the visualizer and sorting algorithms, handles user interactions,
 * and keeps everything running smoothly.
 * 
 * Think of this as mission control - all buttons and controls report here!
 */

// App state - our single source of truth
const AppState = {
    currentAlgorithm: 'bubble',
    arraySize: 50,
    speed: 50,
    isCustomInputMode: false
};

// Algorithm metadata - useful info about each sorting algorithm
const AlgorithmInfo = {
    bubble: {
        name: 'Bubble Sort',
        timeComplexity: 'O(n²)',
        generator: bubbleSort
    },
    selection: {
        name: 'Selection Sort',
        timeComplexity: 'O(n²)',
        generator: selectionSort
    },
    insertion: {
        name: 'Insertion Sort',
        timeComplexity: 'O(n²)',
        generator: insertionSort
    },
    merge: {
        name: 'Merge Sort',
        timeComplexity: 'O(n log n)',
        generator: mergeSort
    },
    quick: {
        name: 'Quick Sort',
        timeComplexity: 'O(n log n)',
        generator: quickSort
    },
    heap: {
        name: 'Heap Sort',
        timeComplexity: 'O(n log n)',
        generator: heapSort
    }
};

/**
 * Initialize the application
 * This runs when the page loads - it's our starting point!
 */
function initApp() {
    console.log('🚀 Sorting Visualizer starting up...');

    // Initialize the visualizer
    if (!Visualizer.init('visualization-container')) {
        console.error('Failed to initialize visualizer!');
        return;
    }

    // Set up all event listeners
    setupEventListeners();

    // Generate initial random array
    Visualizer.generateRandomArray(AppState.arraySize);

    // Update algorithm info display
    updateAlgorithmInfo();

    console.log('✅ App ready! Start sorting to see the magic!');
}

/**
 * Set up all event listeners for UI controls
 * Connecting the buttons to their actions!
 */
function setupEventListeners() {
    // Algorithm selection dropdown
    const algorithmSelect = document.getElementById('algorithm-select');
    algorithmSelect.addEventListener('change', (e) => {
        AppState.currentAlgorithm = e.target.value;
        updateAlgorithmInfo();
    });

    // Array size input
    const arraySizeInput = document.getElementById('array-size');
    arraySizeInput.addEventListener('change', (e) => {
        let size = parseInt(e.target.value);
        // Keep size within reasonable bounds
        size = Math.max(5, Math.min(100, size));
        AppState.arraySize = size;
        e.target.value = size;
        
        // Regenerate array with new size
        if (!Visualizer.getIsRunning()) {
            Visualizer.generateRandomArray(size);
        }
    });

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        AppState.speed = speed;
        speedValue.textContent = speed;
        Visualizer.setSpeed(speed);
    });

    // Generate random array button
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', () => {
        if (!Visualizer.getIsRunning()) {
            Visualizer.generateRandomArray(AppState.arraySize);
        }
    });

    // Custom input button - shows the custom input section
    const customInputBtn = document.getElementById('custom-input-btn');
    customInputBtn.addEventListener('click', () => {
        if (!Visualizer.getIsRunning()) {
            toggleCustomInputSection(true);
        }
    });

    // Apply custom array button
    const applyCustomBtn = document.getElementById('apply-custom-btn');
    applyCustomBtn.addEventListener('click', () => {
        handleCustomArrayInput();
    });

    // Cancel custom input button
    const cancelCustomBtn = document.getElementById('cancel-custom-btn');
    cancelCustomBtn.addEventListener('click', () => {
        toggleCustomInputSection(false);
    });

    // Start sorting button - the main event!
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        startSorting();
    });

    // Stop button - emergency brake!
    const stopBtn = document.getElementById('stop-btn');
    stopBtn.addEventListener('click', () => {
        stopSorting();
    });
}

/**
 * Toggle the custom input section visibility
 * Show or hide the text input for custom arrays
 */
function toggleCustomInputSection(show) {
    const section = document.getElementById('custom-input-section');
    if (show) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
        // Clear the input when hiding
        document.getElementById('custom-array-input').value = '';
    }
}

/**
 * Handle custom array input from user
 * Parse the input and validate it
 */
function handleCustomArrayInput() {
    const input = document.getElementById('custom-array-input').value;
    
    // Parse the input - expect comma-separated numbers
    const values = input.split(',').map(val => val.trim());
    const array = [];

    // Validate and convert to numbers
    for (const val of values) {
        const num = parseFloat(val);
        if (isNaN(num)) {
            alert('Invalid input! Please enter numbers separated by commas.\nExample: 5, 10, 3, 8, 15, 1');
            return;
        }
        // Keep numbers positive and reasonable
        array.push(Math.max(1, Math.abs(num)));
    }

    // Check array size
    if (array.length < 2) {
        alert('Please enter at least 2 numbers to sort!');
        return;
    }

    if (array.length > 100) {
        alert('Too many numbers! Please enter 100 or fewer values.');
        return;
    }

    // Update UI and visualizer
    AppState.arraySize = array.length;
    document.getElementById('array-size').value = array.length;
    
    if (Visualizer.setCustomArray(array)) {
        toggleCustomInputSection(false);
    }
}

/**
 * Update the algorithm information display
 * Show the user what algorithm they selected and its complexity
 */
function updateAlgorithmInfo() {
    const info = AlgorithmInfo[AppState.currentAlgorithm];
    
    document.getElementById('current-algorithm').textContent = info.name;
    document.getElementById('time-complexity').textContent = info.timeComplexity;
}

/**
 * Start the sorting process
 * This is where the show begins!
 */
async function startSorting() {
    if (Visualizer.getIsRunning()) {
        console.log('Already sorting!');
        return;
    }

    // Get the selected algorithm
    const algorithmInfo = AlgorithmInfo[AppState.currentAlgorithm];
    if (!algorithmInfo) {
        console.error('Unknown algorithm:', AppState.currentAlgorithm);
        return;
    }

    console.log(`Starting ${algorithmInfo.name}...`);

    // Disable controls during sorting
    setControlsEnabled(false);

    // Create a generator from the sorting algorithm
    const sortGenerator = algorithmInfo.generator(Visualizer.array);

    // Run the visualization
    await Visualizer.runSort(sortGenerator);

    // Re-enable controls after sorting
    setControlsEnabled(true);

    console.log(`${algorithmInfo.name} complete!`);
}

/**
 * Stop the current sorting process
 * Hit the brakes!
 */
function stopSorting() {
    Visualizer.stop();
    setControlsEnabled(true);
}

/**
 * Enable or disable UI controls
 * Prevent user from changing settings while sorting is in progress
 */
function setControlsEnabled(enabled) {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const generateBtn = document.getElementById('generate-btn');
    const customInputBtn = document.getElementById('custom-input-btn');
    const algorithmSelect = document.getElementById('algorithm-select');
    const arraySizeInput = document.getElementById('array-size');
    const speedSlider = document.getElementById('speed-slider');

    if (enabled) {
        // Enable everything except stop button
        startBtn.disabled = false;
        stopBtn.disabled = true;
        generateBtn.disabled = false;
        customInputBtn.disabled = false;
        algorithmSelect.disabled = false;
        arraySizeInput.disabled = false;
        speedSlider.disabled = false;
    } else {
        // Disable everything except stop button
        startBtn.disabled = true;
        stopBtn.disabled = false;
        generateBtn.disabled = true;
        customInputBtn.disabled = true;
        algorithmSelect.disabled = true;
        arraySizeInput.disabled = true;
        // Keep speed slider enabled so user can adjust during sorting
        speedSlider.disabled = false;
    }
}

// Wait for DOM to be fully loaded before initializing
// Patience is a virtue, especially in JavaScript!
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already loaded
    initApp();
}