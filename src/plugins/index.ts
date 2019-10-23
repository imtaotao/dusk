import { baseReportData } from '../modules/utils'

// 需要传给业务层的数据
export interface ReportNextResult extends Array<any> {
  0: baseReportData
  1: (endData: baseReportData) => Promise<void>
  2?: any
}

export { recordRequestTime } from './request-time'
export { listenerButton } from './template-linstener'