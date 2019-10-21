import Event from '../share/event';
import { WxPage, WxComponent } from './overidde-component';
export interface Options {
}
export default class Dusk extends Event {
    private options;
    version: string;
    types: Array<string>;
    private timeStack;
    depComponents: Map<WxPage | WxComponent, boolean>;
    installedPlugins: Set<(...args: any[]) => any>;
    Router: {
        _listener: import("../share/event").Listener;
    };
    NetWork: {
        _listener: import("../share/event").Listener;
    };
    Template: {
        _listener: import("../share/event").Listener;
    };
    constructor(options: Options);
    report(type: string, val: any): void;
    addPlugin<T extends (dusk: Dusk, ...args: Array<any>) => any>(plugin: T, ...args: any[]): ReturnType<T>;
}
