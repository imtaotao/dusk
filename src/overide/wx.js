import { createWraper } from '../utils'

const catchRouterErr = (sdk, err) => {

}

export default (sdk, rewrite) => {
  // 导航相关方法
  rewrite('navigateTo', function (opts) {
    if (opts) {
      
    }
  })
}