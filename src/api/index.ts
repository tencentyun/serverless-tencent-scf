import Base from "./API";
import ScfAPI from "./scf";
import APIGatewayAPI from "./apigw";
import CamAPI from "./cam";

export default class API extends Base {
  scf = new ScfAPI(this.options, this.provider);
  cam = new CamAPI(this.options, this.provider);
  apigw = new APIGatewayAPI(this.options, this.provider);
}
