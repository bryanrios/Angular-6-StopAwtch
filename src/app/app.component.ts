import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, timer, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    title = 'ng6-stopwatch';

    // RxJs observable 'Timer'. Emits first value at 10 ms delay,
    // ...subsequent incremental values at every 10ms
    // Creating new subscription to subscribe to the Timer Observable
    // Variable to store timer values
    // This is to be used to run the timer.

    timer = timer(10, 10);
    timerSubscription = new Subscription();
    timerMillis = 0;

    // RxJs Observable "Interval", Emits incremental value at the given rate. 100ms
    // Creating new subscription to subscrive to the Interval Timer.
    // This is to be used to update the timer.
    interval = interval(100);
    intervalSubscription = new Subscription();

    // Defining Initial state of the timer.
    state = {
        timerOn: false,
        startTime: null,
        elapsedTime: null,
        lapTimes: []
    };

    // Timer object to save the stopwatch values.
    time = {
        elapsed: null,
        minutes: null,
        seconds: null,
        millis: null
    };



    //=====================================================================
    //---------------------------------------------------------------------
    //  Program Logic.
    //---------------------------------------------------------------------
    // 1. When the compnent loads, it will get the state of the timer.
    // 2. Update the timer values if a state is available.
    // 3. Attach a listener to window storage change events.
    //=====================================================================

    ngOnInit() {
        this.getState();
        this.updateTimer();

        window.addEventListener('storage', e => {
            this.pause();
            this.getState();
        });
    }


    // Method to handle the Play/Pause button.
    togglePlay() {
        // Toggale the play state
        this.state.timerOn = !this.state.timerOn;
        // If the timer is on then...
        if (this.state.timerOn) {
            //  set the start time in the state
            this.state.startTime = new Date();
            // Set the state
            this.setState();
        } else { // If the timer is not running
            // set the start time to null
            this.state.startTime = null;
            // set the elapsed timer value in the state
            this.state.elapsedTime = this.time.elapsed;
            // Set the state
            this.setState();
        }
        // Finally get the state
        this.getState();
    }

    // Method to set the state in local storage.
    setState() { localStorage.setItem('state', JSON.stringify(this.state)); }


    // Primary method that maintains the state of the timer.
    getState() {
        // Get the state form local storage.
        const state = JSON.parse(localStorage.getItem('state'));
        // If state is saved, then...
        if (state) {
            // Set the state in the component
            this.state = state;
            // If the timer is running
            if (this.state.timerOn) {
                // Check if start time was set.
                if (this.state.startTime) {
                    // then calculate how long the timer has been running.
                    this.elapsedTime();
                    // Play the timer
                    this.play();
                } else { // If there is no start time, then just play the timer.
                    this.play();
                }
            } else { // If the timer was not running. Check if elapsed time is zero.
                if (this.state.elapsedTime === 0) {
                    // Pause the timer
                    this.pause();
                    // Reset the timer.
                    this.resetTimer();
                } else { // Otherwise just pause the timer.
                    this.pause();
                }
            }
        } else { // if the state is not saved then set the state.
            this.setState();
        }
    }


    // Play Method will subscribe to the timer and interval observables.
    play() {
        this.timerSubscription =
            this.timer.subscribe(
                val => { this.timerMillis = val; }
            );

        this.intervalSubscription = this.interval.subscribe(
            () => this.updateTimer()
        );
    }


    // Pause will unsubscribe.
    pause() {
        this.intervalSubscription.unsubscribe();
        this.timerSubscription.unsubscribe();
    }


    // Update timer will set the time by adding any time in the state
    // ...with currently running timer and hen calculate time.
    updateTimer() {
        this.time.elapsed = this.state.elapsedTime + this.timerMillis;
        this.calculateTime();
    }


    // Calculate time method will calculate minutes, seconds and milliseconds
    // ... and prepend zeros with the numbers.
    calculateTime() {
        const minuteRemainder = this.time.elapsed % 6000;
        this.time.minutes = (Math.floor(this.time.elapsed / 6000).toString()).padStart(2, '0');
        this.time.seconds = (Math.floor(minuteRemainder / 100).toString()).padStart(2, '0');
        this.time.millis = ((minuteRemainder % 100).toString()).padStart(2, '0');
    }


    // Elapsed time calculation
    elapsedTime() {
        const now = new Date();
        const start = new Date(this.state.startTime);
        const lostTime = (now.getTime() - start.getTime()) / 10; // Dividing by 10 because the timer emits values every 10ms
        this.state.elapsedTime = this.state.elapsedTime + Math.floor(lostTime);
    }


    // Method to reset timer
    // Unsubscribe to the timers by calling the pause method.
    // Reset everything to initial state.
    // Then set the state.
    resetTimer() {
        this.pause();
        this.timerMillis = 0;
        this.time = {
            elapsed: 0,
            minutes: 0,
            seconds: 0,
            millis: 0
        };
        this.state = {
            timerOn: false,
            startTime: null,
            elapsedTime: 0,
            lapTimes: []
        };
        this.setState();
    }


    // Method to add laptimes under the stopwatch.
    addLap() {
        // Making a copy of the currently in-use time object.
        const lap = { ...this.time };
        // Checking to make sure the timer was running so that zero laptimes are not added. 
        // Then update the state.
        if (lap.millis) {
            this.state.lapTimes.splice(0, 0, lap);
            this.setState();
        }
    }


    // Remove the laptime at the given index and set the state.
    removeLap(i) {
        this.state.lapTimes.splice(i, 1);
        this.setState();
    }


    // Set the state when the component is destroyed.
    ngOnDestroy() {
        this.setState();
    }

}
