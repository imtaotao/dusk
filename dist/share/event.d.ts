interface EventItem {
    once: Array<Function>;
    normal: Array<Function>;
}
interface Listener {
    [key: string]: EventItem;
}
export default class Event {
    _listener: Listener;
    on(type: string, fn: Function): boolean;
    once(type: string, fn: Function): boolean;
    off(type: string, fn?: Function): boolean;
    offAll(): void;
    emit(type: string, data?: Array<any>): boolean;
}
export {};
