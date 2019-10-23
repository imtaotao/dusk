import Event from '../share/event';
import Router from '../modules/router';
import NetWork from '../modules/network';
import Template from '../modules/template';
import { WxPage, WxComponent } from './overidde-component';
export interface Options {
    url: string;
}
export default class Dusk extends Event {
    options: Options;
    version: string;
    Utils: {
        once: <T extends (...args: any[]) => any>(fn: T) => T;
        createWraper: <T_1 extends (...args: any[]) => any>(target?: T_1 | undefined, before?: T_1 | undefined, after?: T_1 | undefined) => T_1;
        uuid(): string;
        unid(): string;
        randomId(max?: number, min?: number, fraction?: number): string;
        getCurrentPage(): WxPage | null;
    };
    Router: Router;
    NetWork: NetWork;
    Template: Template;
    types: Array<string>;
    timeStack: any;
    depComponents: Map<WxPage | WxComponent, boolean>;
    installedPlugins: Set<(...args: any[]) => any>;
    constructor(options: Options);
    addType(type: string): void;
    report(type: string, val: any): void;
    addPlugin<T extends (dusk: Dusk, ...args: Array<any>) => any>(plugin: T, ...args: any[]): ReturnType<T>;
    time(type: string): void;
    timeEnd(type: string, fn?: (duration: number) => void): number | null;
}
