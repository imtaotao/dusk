import Event from '../share/event';
export interface Options {
}
export default class SDK extends Event {
    private options;
    constructor(options: Options);
}
