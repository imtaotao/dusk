import { baseReportData } from '../modules/network'

// 需要传给业务层的数据
export interface ReportNextResult extends Array<any> {
  0: baseReportData
  1: (endData: baseReportData) => Promise<void>
  2?: any
}

// 新增的插件在这里 export 出去就行
export { autoSendRequest } from './auto-request'
export { recordRequestTime } from './request-time'
export { listenerButton } from './template-linstener'