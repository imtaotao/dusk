import { WxPage } from '../core/overidde-component';
export interface baseReportData {
    t: number;
    p: string;
    unid: number;
    exd: {
        [key: string]: any;
    };
    tp: 0 | 1 | 2 | 3 | 4 | 5;
    sp: 'log' | 'stat' | 'monitor';
}
declare const _default: {
    once: <T extends (...args: any[]) => any>(fn: T) => T;
    createWraper: <T_1 extends (...args: any[]) => any>(target?: T_1 | undefined, before?: T_1 | undefined, after?: T_1 | undefined) => T_1;
    uuid(): string;
    unid(): string;
    randomId(max?: number, min?: number, fraction?: number): string;
    getCurrentPage(): WxPage | null;
    baseReportData(tp: 0 | 1 | 2 | 3 | 4 | 5, sp: "log" | "stat" | "monitor", moduleTag: string, expandData?: {
        [key: string]: any;
    } | undefined): {
        tp: 0 | 1 | 2 | 3 | 4 | 5;
        sp: "log" | "stat" | "monitor";
        t: number;
        bm: string;
        unid: any;
        exd: {
            [key: string]: any;
        };
        p: any;
    };
    report(url: string, data: any, method: "GET" | "POST", header?: Object): Promise<void>;
};
export default _default;
