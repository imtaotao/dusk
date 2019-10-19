import Event from '../share/event';
import { Page, Component } from './overidde-component';
export interface Options {
}
export default class SDK extends Event {
    private options;
    depComponents: Map<Page | Component, boolean>;
    constructor(options: Options);
    update(): void;
}
