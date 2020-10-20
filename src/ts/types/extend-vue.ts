/**
 * In this file we extend the Vue type to add a field to the application object: $actionCmp.
 * This field stores the different actions the WebUI implements (defined in plugins).
 */
import {ActionData} from "@/ts/utils/action-utils";

declare module "vue/types/vue" {
    interface Vue {
        $actionCmp: Array<ActionData>;
    }
}

export {};
