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
export default class NetWork extends Event {
}
