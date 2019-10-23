import { baseReportData } from '../modules/utils';
export interface ReportNextResult extends Array<any> {
    0: baseReportData;
    1: (endData: baseReportData) => Promise<void>;
    2?: any;
}
export { recordRequestTime } from './request-time';
export { listenerButton } from './template-linstener';
