import {Message} from "@/types/ws-message";
import {GridJson} from "@/types/sg-json.types";

interface LoadApproxMsg extends Message {
    grid: GridJson
}