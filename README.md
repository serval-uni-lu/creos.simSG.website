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

Folders description:

- `public`: contains the css files and the index file of the website
- `src`: all sources files
    - `assets`: images or others resources used in the application
    - `images`: contains the source file for the logos we created
    - `pages`: contains the [Vue.js](https://vuejs.org/) source files
    - `plugin`: contains the Vue.jss plugins, mainly the actionner
    - `router`: contains the definition of the paths for our application
    - `scss`: contains a set of SCSS files used in our application and shared by several components
    - `store`: contains the implementation of the state management of our application ([Vuex](https://vuex.vuejs.org/))
    - `ts`: contains all the typescript code used by the components. We put them in separate files to simplify Vue files
    - `main.ts`: entry point of the application

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
    - at the connection, if the server wants to use this action, it should add the name in the `ActionListMsg` message
- in `src/main.ts`, decalare the plugin you want to use: `Vue.use(<PLUGIN_NAME>);`

Two plugins have been implemented and can be used as running example: `src/plugin/action/loadApprox` and `src/plugin/action/uLoadApprox`.

**Disclaimer**: A better mechanism might exist to achieve a similar goal. It might also be an over-engineering design. Also, a similar objective exists for the inspector.

## Web socket communication

For the communication with the backend, we added a websocket (see `src/ws/index.ts`). 
The connection is established at the loading phase of the WebUI. 
**Warning**: if the server starts after the WebUI, you will have to reload the page to establish the connection.
Currently, there is no mechanism to attempt connection regularly (see [Issue 10](https://github.com/UL-SnT-Serval/creos.simSG.website/issues/10)).

At the connection, the server sends a message containing the list of all actions it implements (see `ActionListMsg` interface).
Then, the WebUI and the server communicates using JSON formatted data.
From the UI, the message type should implement the `Message` interface.
It contains at least one element: the type.
**Warning**: the type should correspond to one handled by the server. 
Do not forget to synchronise the `MsgType` type with the new message types added in the server.

## Version schema

For this project, we use the [calendar versioning schema](https://calver.org/).

Schema used: ![](https://img.shields.io/badge/calver-YYYY.0M.0D-22bfda.svg)

- YYYY: full year  (*e.g.,* 2006, 2016, 2106)
- 0M: zero-padded month  (*e.g.,* 01, 02, 11, 12)

SimSG is a research prototype, mainly used by those who developed it. 
Its main goal is to be used as demonstration tool for academic conference or in front of (potential) partners.
The version number will not be used to inform users about new features or patches fix.
Instead, the goal was to use it as timestamp and refer them in report, academic papers, or any other written document.

