import { once, createWraper } from '../share/utils'
import { WxPage } from '../core/overidde-component'

declare const wx: any
declare const getCurrentPages: () => Array<WxPage>

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

  getCurrentPage () {
    const pages = getCurrentPages()
    return Array.isArray(pages) && pages.length > 0
        ? pages[pages.length - 1]
        : null
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