# SimSG website

Front end of the smart grid simulator. Should run along with the [Java backend](https://github.com/ul-snt-serval/creos.simSG.api).

## Features

- Scenario viewer
  - displays and allows the manipulation (fuse states, consumption) of predefined scenarios (those given by Creos S.A. to show how load is approximated)
- Topology builder: allows the creation and the manipulation of a custom topology
  - Add, delete entities (cabinet, substation, meter) and cable
  - Modify fuse states
  - Set meter consumption
- Real-case viewer: displays and allows the manipulation (fuse states, consumption) of the Reckange power grid
- Actionner: from these three views, one can add and execute custom actions. Currently, two actions have been implemented:
  - Load approximation
  - Uncertain load approximation (naive and with business rules)


## Project setup

**Add the description of the Reckange topology**: In order to use the real-case viewer, you need to add the Reckange grid topology from the `creos.data` repository to the `src/assets/grids/` folder and name it `real-case.json`. 

- Install the dependencies:
    - `npm install`
- Compiles and hot-reloads for development
    - `npm run serve`
- Compiles and minifies for production
    - `npm run build`
- Run the unit tests (**WARNING**: none have been implemented)
    - `npm run test:unit`
- Run the end-to-end tests (**WARNING**: none have been implemented)
    - `npm run test:e2e`
- Lints and fixes files
    - `npm run lint`
    
## Project structure

The project structure follows the default structure of a [Vue.js](https://vuejs.org/) project. In this project, views are the pages accessible through the top-level of the navigation menu. The other elements are components.

## View elements

We divided all views that manipulate a grid (scenario viewer, topology builder and real-case viewer) in three part: the actionner, the viewer, and the inspector. 
They all have different objectives:

- *actionner*: to trigger actions based on the grid viewed.
- *viewer*: to give an overview of the grid. Different elements can be shown such as the topology, the cable and fuse loads. However, more can be implemented such as the reacabiity of cables, how much a cable is near overloading or overloading, ...
- *inspector*: to show details information about a selected element (fuse, cable, entity).  

**Actionner**: Even though actions can be executed on the client side, we would recommend implementing them on the server side. 
It will make a clear separation between the view and the model, with its business logic. 
Towards this goal, we first add a websocket that connects to a server on loading.
This implementation has a lot of drawback and requires tedious work.
One can easily improve it.

We tried to implement a mechanism to allow anyone adding an actionner with the minimal work, or just focusing on that.
Towards this goal, we use the [plugin mechanism of Vue.js](https://v3.vuejs.org/guide/plugins.html).
To add an actionner one needs to:

- create a new folder in `src/plugin/action` with the desired name
- create a TypeScript file that follows the Vue.js plugin implementation [requirements](https://v3.vuejs.org/guide/plugins.html). 
- create a Vue.js file for the component. It should contain, at least, one button that triggers the action by, for example, sending a websocket message.
    - the install function should add an element to the `Vue.$actionCmp` action list that respects the `ActionData` interface
    - the name should be unique
    - at the connection, if the server wants to use this action, it should add the name in the `ActionList` message
- in `src/main.ts`, decalare the plugin you want to use: `Vue.use(<PLUGIN_NAME>);`

Two plugins have been implemented and can be used as running example: `src/plugin/action/loadApprox` and `src/plugin/action/uLoadApprox`.

**Disclaimer**: A better mechanism might exist to achieve a similar goal. It might also be an over-engineering design. Also, a similar objective exists for the inspector.

## Web socket communication

For the communication with the backend, we added a websocket.
