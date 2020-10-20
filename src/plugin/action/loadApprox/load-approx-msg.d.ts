import {Message} from "@/ts/types/ws-message";
import {GridJson} from "@/ts/types/sg-json.types";

type ApproximationType = "naive" | "bs_rule";

interface LoadApproxMsg extends Message {
    grid: GridJson;
    approximationType?: ApproximationType;
}

