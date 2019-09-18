/**
 * Created by johann on 08.07.19.
 */
export declare class TimeSlider {
    first: number;
    last: number;
    interval: number;
    onChange: (newTimestamp: number) => void;
    shown: number;
    animation: boolean;
    play: any;
    startTime: number;
    endTime: number;
    attribution: string;
    configure(configuration: any): void;
    getTime(pTimestamp: any): string;
    getDay(pTimestamp: any): string;
    onForward(): void;
    onBackwards(): void;
    onPlay(): void;
    roundtoInterval(timestamp: any, interval: any, offset: any): any;
    onPickedTimestamp(click: any): void;
    setTimestamp(newTimestamp: any): void;
    setOnChange(pFunction: any): void;
}
