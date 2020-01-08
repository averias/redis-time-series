import { InfoResponseRender } from "../response/infoResponseRender";
import { MultiGetResponseRender } from "../response/multiGetResponseRender";
import { MultiRangeResponseRender } from "../response/multiRangeResponseRender";

export class RenderFactory {
    public getMultiRangeRender(): MultiRangeResponseRender {
        return new MultiRangeResponseRender();
    }

    public getMultiGetRender(): MultiGetResponseRender {
        return new MultiGetResponseRender();
    }

    public getInfoRender(): InfoResponseRender {
        return new InfoResponseRender();
    }
}
