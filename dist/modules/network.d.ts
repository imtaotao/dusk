import Dusk from 'src/core/dusk';
import Event from '../share/event';
export interface RequestOptions {
    url: string;
    data: any;
    record?: boolean;
    header?: Object;
    dataType: string;
    responseType: string;
    fail?: (error: Error) => void;
    success?: (result: any) => void;
    complete?: () => void;
    method: 'GET' | 'PUT' | 'POST' | 'HEAD' | 'DELETE' | 'TRACE' | 'CONNECT' | 'OPTIONS';
}
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
export default class NetWork extends Event {
    private dusk;
    constructor(dusk: Dusk);
    baseReportData(tp: baseReportData['tp'], sp: baseReportData['sp'], moduleTag: string, expandData?: {
        [key: string]: any;
    }): {
        tp: 0 | 1 | 2 | 3 | 4 | 5;
        sp: "log" | "stat" | "monitor";
        t: number;
        bm: string;
        exd: {
            [key: string]: any;
        };
        unid: string;
        p: string;
    };
    report(url: string, data: any, method: 'GET' | 'POST', header?: Object): Promise<void>;
}
