import Dusk from './dusk'

interface CustomWx {

}

declare let wx: CustomWx & Object

const nativeWX = wx

export default function overiddenWX (dusk: Dusk) {
  
}