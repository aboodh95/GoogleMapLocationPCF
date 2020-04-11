export class Util {
  public static getPageParameters(): {
    appid: string;
    pagetype: string;
    etn: string;
    id: string;
  } {
    const url = window.location.href;
    const parametersString = url.split("?")[1];
    let parametersObj: any = {};
    if (parametersString) {
      for (let paramPairStr of parametersString.split("&")) {
        let paramPair = paramPairStr.split("=");
        parametersObj[paramPair[0]] = paramPair[1];
      }
    }
    return parametersObj;
  }
}
