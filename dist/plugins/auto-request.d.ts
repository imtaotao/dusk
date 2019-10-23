import Dusk from 'src/core/dusk';
import { baseReportData } from '../modules/network';
declare type AcceptData = [baseReportData['tp'], baseReportData['sp'], string, baseReportData['exd']];
declare type FilterData = (type: string, value: any, gen: (...args: AcceptData) => baseReportData) => void;
export declare function autoSendRequest(dusk: Dusk, filterData: FilterData): void;
export {};
