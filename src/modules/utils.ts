import { once, createWraper } from '../share/utils'
import { WxPage } from '../core/overidde-component'

declare const wx: any
declare const getCurrentPages: () => Array<WxPage>

export interface baseReportData {
  t: number
  p: string
  unid: number
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

export default {
  once,

  createWraper,

  uuid () {
    const uuidFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return uuidFormat.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  unid () {
    const ramdomNum = parseInt(Math.random().toString().slice(-6)).toString(16)
    const oxtimestamp = parseInt(Date.now() as any).toString(16)
    return `za-${ramdomNum}-${oxtimestamp}`
  },

  // 返回 6 位随机 id
  randomId (max = 1000000, min = 0, fraction = 0) {
    return Number(Math.random() * (max - min) + min).toFixed(fraction)
  },

  getCurrentPage () {
    const pages = getCurrentPages()
    return Array.isArray(pages) && pages.length > 0
        ? pages[pages.length - 1]
        : null
  },

  // 返回一个基础的上报数据集
  baseReportData (
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
      unid: this.unid(),
      exd: expandData || {},
      p: (this.getCurrentPage() || { route: '' }).route,
    }
  },

  // 发送上报请求的工具方法
  report (
    url: string,
    data: any,
    method: 'GET' | 'POST',
    header: Object = {},
  ) : Promise<void> {
    return new Promise(resolve => {
      wx.request({ url, data, method, header, complete: resolve })
    })
  },
}