import Event from '../share/event';
import Router from '../modules/router';
import NetWork from '../modules/network';
import Template from '../modules/template';
import { WxPage, WxComponent } from './overidde-component';
export interface Options {
}
export default class Dusk extends Event {
    private options;
    version: string;
    Router: Router;
    NetWork: NetWork;
    Template: Template;
    types: Array<string>;
    private timeStack;
    depComponents: Map<WxPage | WxComponent, boolean>;
    installedPlugins: Set<(...args: any[]) => any>;
    constructor(options: Options);
    Utils: {
        once: <T extends (...args: any[]) => any>(fn: T) => T;
        createWraper: <T_1 extends (...args: any[]) => any>(target?: T_1 | undefined, before?: T_1 | undefined, after?: T_1 | undefined) => T_1;
    };
    report(type: string, val: any): void;
    addPlugin<T extends (dusk: Dusk, ...args: Array<any>) => any>(plugin: T, ...args: any[]): ReturnType<T>;
    time(type: string): void;
    timeEnd(type: string, fn?: (duration: number) => void): number | null;
}
