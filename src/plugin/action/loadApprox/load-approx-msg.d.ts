import {Message} from "@/types/ws-message";
import {GridJson} from "@/types/sg-json.types";

type ApproximationType = "naive" | "bs_rule";

interface LoadApproxMsg extends Message {
    grid: GridJson;
    approximationType?: ApproximationType;
}

