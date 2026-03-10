/*
 * Visualizer Module
 * 
 * This module handles all the visual magic - creating bars, animating them,
 * and making sorting algorithms look beautiful!
 * 
 * The visualizer is like a theater director - it takes the sorting algorithm's
 * instructions and turns them into a visual performance.
 */

const Visualizer = {
    // Our current state - keeping track of what's happening
    container: null,
    array: [],
    bars: [],
    isRunning: false,
    shouldStop: false,
    currentSpeed: 50,
    
    // Stats tracking - because numbers are cool
    stats: {
        comparisons: 0,
        swaps: 0
    },

    /**
     * Initialize the visualizer with a container element
     * This is like setting up the stage before the show
     */
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found! Did you forget to create it?');
            return false;
        }
        return true;
    },

    /**
     * Generate a random array of numbers
     * Perfect for when you don't want to think too hard about test data
     */
    generateRandomArray(size) {
        this.array = [];
        // Generate random numbers between 10 and 500
        for (let i = 0; i < size; i++) {
            this.array.push(Math.floor(Math.random() * 490) + 10);
        }
        this.renderBars();
        this.resetStats();
    },

    /**
     * Set a custom array provided by the user
     * For those who like to be in control!
     */
    setCustomArray(array) {
        if (!Array.isArray(array) || array.length === 0) {
            console.error('Invalid array provided!');
            return false;
        }
        this.array = [...array];
        this.renderBars();
        this.resetStats();
        return true;
    },

    /**
     * Render bars based on current array
     * This creates the visual representation of our data
     */
    renderBars() {
        // Clear existing bars - out with the old!
        this.container.innerHTML = '';
        this.bars = [];

        // Find max value to scale bars properly
        const maxValue = Math.max(...this.array);
        const containerHeight = 400; // Match min-height from CSS

        // Calculate bar width based on container and array size
        const containerWidth = this.container.offsetWidth;
        const barWidth = Math.max(2, (containerWidth - this.array.length * 2) / this.array.length);

        // Create a bar for each value
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar default';
            
            // Calculate height proportional to value
            const height = (value / maxValue) * (containerHeight - 40);
            bar.style.height = `${height}px`;
            bar.style.width = `${barWidth}px`;
            bar.setAttribute('data-value', value);
            
            this.container.appendChild(bar);
            this.bars.push(bar);
        });
    },

    /**
     * Update bar colors based on their state
     * Colors tell the story of what's happening!
     */
    updateBarStates(indices, state) {
        // Reset all bars to default first
        this.bars.forEach(bar => {
            if (!bar.classList.contains('sorted')) {
                bar.className = 'bar default';
            }
        });

        // Apply the new state to specified bars
        if (indices && indices.length > 0) {
            indices.forEach(index => {
                if (index >= 0 && index < this.bars.length) {
                    this.bars[index].className = `bar ${state}`;
                }
            });
        }
    },

    /**
     * Update the array and re-render bars
     * Used when values are swapped during sorting
     */
    updateArray(newArray) {
        this.array = [...newArray];
        
        // Update bar heights to match new values
        const maxValue = Math.max(...this.array);
        const containerHeight = 400;

        this.array.forEach((value, index) => {
            const height = (value / maxValue) * (containerHeight - 40);
            this.bars[index].style.height = `${height}px`;
            this.bars[index].setAttribute('data-value', value);
        });
    },

    /**
     * Calculate delay based on speed setting
     * Higher speed = shorter delay = faster animation
     */
    getDelay() {
        // Speed ranges from 1 to 100
        // Convert to delay: speed 1 = 200ms, speed 100 = 1ms
        return Math.max(1, 201 - (this.currentSpeed * 2));
    },

    /**
     * Sleep function for creating delays
     * Because sometimes we need to pause for dramatic effect
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Reset statistics counters
     * Start fresh for a new sorting run
     */
    resetStats() {
        this.stats.comparisons = 0;
        this.stats.swaps = 0;
        this.updateStatsDisplay();
    },

    /**
     * Update the stats display in the UI
     * Keep the user informed of what's happening
     */
    updateStatsDisplay() {
        const comparisonElement = document.getElementById('comparison-count');
        const swapElement = document.getElementById('swap-count');
        
        if (comparisonElement) {
            comparisonElement.textContent = this.stats.comparisons;
        }
        if (swapElement) {
            swapElement.textContent = this.stats.swaps;
        }
    },

    /**
     * Run a sorting algorithm with visualization
     * This is where the magic happens!
     */
    async runSort(sortGenerator) {
        if (this.isRunning) {
            console.log('Already running a sort!');
            return;
        }

        this.isRunning = true;
        this.shouldStop = false;
        this.resetStats();

        // Reset all bars to default state
        this.bars.forEach(bar => {
            bar.className = 'bar default';
        });

        // Process each step from the sorting algorithm
        for (const step of sortGenerator) {
            // Check if user wants to stop
            if (this.shouldStop) {
                console.log('Sorting stopped by user');
                break;
            }

            // Handle different types of operations
            switch (step.type) {
                case 'compare':
                    // Show which elements are being compared
                    this.updateBarStates(step.indices, 'comparing');
                    this.stats.comparisons++;
                    this.updateStatsDisplay();
                    await this.sleep(this.getDelay());
                    break;

                case 'swap':
                    // Show the swap happening
                    this.updateBarStates(step.indices, 'swapping');
                    this.stats.swaps++;
                    this.updateStatsDisplay();
                    if (step.array) {
                        this.updateArray(step.array);
                    }
                    await this.sleep(this.getDelay());
                    break;

                case 'sorted':
                    // Mark elements as sorted (they're in their final position!)
                    step.indices.forEach(index => {
                        if (index >= 0 && index < this.bars.length) {
                            this.bars[index].className = 'bar sorted';
                        }
                    });
                    break;

                case 'done':
                    // Sorting complete! Make sure final array is displayed
                    if (step.array) {
                        this.updateArray(step.array);
                    }
                    // Mark all bars as sorted
                    this.bars.forEach(bar => {
                        bar.className = 'bar sorted';
                    });
                    break;
            }
        }

        this.isRunning = false;
        console.log('Sorting complete!');
    },

    /**
     * Stop the current sorting operation
     * Emergency brake for when things get too fast!
     */
    stop() {
        this.shouldStop = true;
        this.isRunning = false;
    },

    /**
     * Set the animation speed
     * Go fast or go slow - your choice!
     */
    setSpeed(speed) {
        this.currentSpeed = Math.max(1, Math.min(100, speed));
    },

    /**
     * Get current running state
     * Are we sorting or are we chilling?
     */
    getIsRunning() {
        return this.isRunning;
    }
};

// Make the visualizer available globally
// (In modules, we'd export it, but we're keeping it simple with global scope)