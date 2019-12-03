import Dusk from 'src/core/dusk'
import Event from '../share/event'

declare const wx: any

export interface RequestOptions {
  url: string
  data: any
  record?: boolean // 如果有这个属性，则需要记录上报
  header?: Object
  dataType: string
  responseType: string
  fail?: (error: Error) => void
  success?: (result: any) => void
  complete?: () => void
  method:
      'GET'
    | 'PUT'
    | 'POST'
    | 'HEAD'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT'
    | 'OPTIONS'
}

export interface baseReportData {
  t: number
  p: string
  bm?: string
  unid: string
  exd: { [key : string] : any }
  /**
   * type，日志的类型
   *  0 页面访问
   *  1 连接点击量
   *  2 按钮点击量
   *  3 区域点击量
   *  4 位置点击量
   *  5 请求时长
   */
  tp: 0 | 1 | 2 | 3 | 4 | 5
  /**
   * scope, 对日志进行一级分类
   *  log 日志
   *  stat 数据统计
   *  monitor 监控
   */
  sp: 'log' | 'stat' | 'monitor'
}

export default class NetWork extends Event {
  private dusk: Dusk

  public constructor (dusk: Dusk) {
    super()
    this.dusk = dusk
  }

  // 返回一个基础的上报数据集
  public baseReportData (
    tp: baseReportData['tp'],
    sp: baseReportData['sp'],
    moduleTag: string,
    expandData?: { [key : string] : any }
  ) {
    return {
      tp,
      sp,
      t: Date.now(),
      bm: moduleTag,
      exd: expandData || {},
      unid: this.dusk.Utils.unid(),
      p: (this.dusk.Utils.getCurrentPage() || { route: '' }).route,
    }
  }

  // 发送上报请求的工具方法
  public report (
    url: string,
    data: any,
    method: 'GET' | 'POST',
    header: Object = {},
  ) : Promise<void> {
    return new Promise(resolve => {
      wx.request({ url, data, method, header, complete: resolve })
    })
  }
}