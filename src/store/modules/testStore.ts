import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module({namespaced: true})
class TestState extends VuexModule {
    public value = 10;

    @Mutation
    public double() {
        this.value = this.value * 2;
    }
}

export default TestState;