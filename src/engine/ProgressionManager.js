export class ProgressionManager {
    constructor(progressionKey, onStepChange, progressions) {
        this.progressions = progressions;
        this.currentProgressionKey = progressionKey;
        this.currentStepIndex = 0;
        this.timer = null;
        this.onStepChange = onStepChange; // Callback(step, stepIndex)
        this.isRunning = false;
        this.speedMultiplier = 1.0;
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
    }

    setProgression(key) {
        if (this.currentProgressionKey === key) return;
        
        this.currentProgressionKey = key;
        this.currentStepIndex = 0;
        
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.scheduleNextStep(0); // Start immediately
    }

    stop() {
        this.isRunning = false;
        if (this.timer) clearTimeout(this.timer);
        this.onStepChange(null, -1); // Clear active step
    }

    scheduleNextStep(delay) {
        this.timer = setTimeout(() => {
            if (!this.isRunning) return;

            const progression = this.progressions[this.currentProgressionKey];
            const step = progression.steps[this.currentStepIndex];

            // Notify App of new step
            this.onStepChange(step, this.currentStepIndex);

            // Advance index
            this.currentStepIndex = (this.currentStepIndex + 1) % progression.steps.length;

            // Schedule next
            // Apply speed multiplier: higher speed = shorter duration
            const nextDuration = (step.duration * 1000) / this.speedMultiplier;
            this.scheduleNextStep(nextDuration);

        }, delay);
    }
}
