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

**Add the description of the reckange topology**: In order to use the real-case viewer, you need to add the Reckange grid topology from the `creos.data` repository to the `src/assets/grids/` folder and name it `real-case.json`. 

```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
