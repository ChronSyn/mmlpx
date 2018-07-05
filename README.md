# mmlpx

[![npm version](https://img.shields.io/npm/v/mmlpx.svg?style=flat-square)](https://www.npmjs.com/package/mmlpx)
[![coverage](https://img.shields.io/codecov/c/github/mmlpxjs/mmlpx.svg?style=flat-square)](https://codecov.io/gh/mmlpxjs/mmlpx)
[![npm downloads](https://img.shields.io/npm/dt/mmlpx.svg?style=flat-square)](https://www.npmjs.com/package/mmlpx)
[![Build Status](https://img.shields.io/travis/mmlpxjs/mmlpx.svg?style=flat-square)](https://travis-ci.org/mmlpxjs/mmlpx)

mmlpx is abbreviation of **mobx model layer paradigm**, inspired by [CQRS](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) and [Android Architecture Components](https://developer.android.google.cn/topic/libraries/architecture/), aims to provide a mobx-based generic layered architecture in single page application.

## Installation

```bash
npm i mmlpx -S
```

or

```bash
yarn add mmlpx
```

## Requirements

* MobX: ^3.2.1 || ^4.0.0 || ^5.0.0

## Motivation

Try to explore the possibilities for building a view-framework-free data layer based on mobx, summarize the generic model layer paradigm, and provide the relevant useful toolkits to make it easier and more intuitive.

## Boilerplates

* [mmlpx-todomvc](https://github.com/mmlpxjs/mmlpx-todomvc)

## Features

```ts
import { inject, onSnapshot, getSnapshot, applySnapshot } from 'mmlpx'
import Store from './Store'

@observer
class App extends Component {
  
  @inject() store: Store
  
  stack: any[]
  cursor = 0
  disposer: IReactionDisposer
  
  componentDidMount() {
    this.stack.push(getSnapshot());
    this.disposer = onSnapshot(snapshot => {
      this.stack.push(snapshot)
      this.cursor = this.stack.length - 1
      this.store.saveSnapshot(snapshot)
    })
  }
    
  componentWillUmount() {
    this.disposer();
  }
  
  redo() {
    applySnapshot(this.stack[++this.cursor])
  }
  
  undo() {
    applySnapshot(this.stack[--this.cursor])
  }
}
```

### DI System

It is well known that MobX is an value-based reactive system which lean to oop paradigm, and we defined our states with a class facade usually. To avoid constructing the instance everytime we used and to enjoy the other benifit(unit test and so on), [di](https://en.wikipedia.org/wiki/Dependency_injection) system is the spontaneous choice.

mmlpx DI system was deep inspired by [spring ioc](https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/core.html#beans).

#### typescript usage

```ts
import { inject, ViewModel, Store } from 'mmlpx';
@Store
class Store {}
@ViewModel
class AppViewModel {
	@inject() store: Store;
}
```

Due to we leverage the metadata description ability of typescript, you need to make sure that you had configured `emitDecoratorMetadata: true`  in your `tsconfig.json`.

#### javascript usage

```js
import { inject, ViewModel, Store } from 'mmlpx';
@Store
class Store {}
@ViewModel
class AppViewModel {
	@inject(Store) store;
}
```

#### more advanced

Sometimes you may need to intialize your dependencies dynamically, such as the constructor parameters came from router query string. Fortunately `mmlpx` supported the ability via `inject`.

```js
import { inject, ViewModel } from 'mmlpx'

@ViewModel
class ViewModel {
    @observable.ref
    user = {};
    
    constructor(projectId, userId) {
        this.projectId = projectId;
        this.userId = userId;
    }
    
    loadUser() {
        this.user = this.http.get(`/projects/${projectId}/users/${userId}`);
    }
}

class App extends Component {
    @inject(ViewModel, app => [app.props.params.id, app.props.params])
    viewModel;
    
    componentDidMount() {
        this.viewModel.loadUser();
    }
}
```

`inject` decorator support four recipes initilizaztion:

* `inject() viewModel: ViewModel;` only for typescript.
* `inject(ViewModel) viewModel;` generic usage.
* `inject(ViewModel, 10, 'kuitos') viewModel;`  initialized with static parameters for `ViewModel` constrcutor.
* `inject(ViewModel, instance => instance.router.props) viewModel;` initialized with dynamic instance props for `ViewModel` constructor.

**Notice that all the `Store` decorated class are singleton and that was the default behavior in mmlpx di system**, if you wanna make your state live around the component lifecycle, always decorated them with `ViewModel` decorator.

### Time Travelling

Benefit from the power of model managment by di system, mmlpx supported time travelling out of box.

All you need are the three apis: `getSnapshot`, `applySnapshot` and `onSnapshot`.

* `function getSnapshot(injector?: Injector): Snapshot;`

  `function getSnapshot(modelName: string, injector?: Injector): Snapshot;`

* `function applySnapshot(snapshot: Snapshot, injector?: Injector): void;`

* `function onSnapshot(onChange: (snapshot: Snapshot) => void, injector?: Injector): IReactionDisposer;`
  `function onSnapshot(modelName: string, onChange: (snapshot: Snapshot) => void, injector?: Injector): IReactionDisposer;`

That's to say, mmlpx makes mobx do [HMR](https://github.com/mmlpxjs/mmlpx/blob/master/src/api/makeHot.ts) and [SSR](https://ssr.vuejs.org/#what-is-server-side-rendering-ssr) possible as well!

As we need to serialize the stores to persistent object, and active stores with deserialized json, we should give a name to our `Store`:

```ts
@Store('UserStore')
class UserStore {}
```

Fortunately mmlpx had provided [ts-plugin-mmlpx](https://github.com/mmlpxjs/ts-plugin-mmlpx) to generate store name automatically, you needn't to named your stores manually.

<div align="center">
   <img src="https://github.com/mmlpxjs/mmlpx-todomvc/blob/master/todomvc.gif?raw=true">
</div>

You can check the [mmlpx-todomvc redo/undo demo](https://mmlpxjs.github.io/mmlpx-todomvc) and the [demo source code](https://github.com/mmlpxjs/mmlpx-todomvc/blob/master/src/containers/TodoApp/ViewModel.ts#L124) for details.

Notice

## Layered Architecture Overview

<div align="center">
   <img src="https://github.com/mmlpxjs/mmlpx/blob/gh-pages/assets/mmlpx.png?raw=true">
</div>

### Loader

Data accessor for remote or local data fetching, converting the data structure to match definited models.

```ts
class UserLoader {
    async getUsers() {
        const users = await this.http.get<User[]>('/users');
        return users.map(user => ({
            name: user.userName,
            age: user.userAge,
        }))
    }
}
```

### Store

Business logic and rules definition, equate to the model in [mvvm architecture](https://msdn.microsoft.com/en-us/library/hh848246.aspx), singleton in an application. Also it known as domain object in [DDD](https://en.wikipedia.org/wiki/Domain-driven_design). And Store always represent the single source of truth of the application.

```ts
import { observable, action } from 'mobx';
import { Store, inject } from 'mmlpx';
import UserLoader from './UserLoader';

@Store
class UserStore {
    
    @inject() loader: UserLoader;
    
    @observable users: User[];
    
    @action
    async loadUsers() {
        const users = await this.loader.getUsers();
        this.users = users;
    }
}
```

### ViewModel

Page interaction logic definition, live around the component lifecycle,  `ViewModel` instance can not be stored in ioc container. Besides the UI-domain local states, others states are derived from `Store` via `@computed` in `ViewModel`. 

The global states mutation are resulted by store **command** invocation from `ViewModel`, and the separated **queries** are represented by transparent subscriptions with `computed` decorator.

```ts
import { observable, action } from 'mobx';
import { postConstruct, ViewModel, inject } from 'mmlpx';

@ViewModel
class AppViewModel {
    
    @inject() userStore: UserStore;
    
    @observable loading = true;
    
    @computed
    get userNames() {
        return this.userStore.users.map(user => user.name);
    }
    
    @action
    setLoading(loading: boolean) {
        this.loading = loading;
    }
    
    @postConstruct
    async onInit() {
        await this.userStore.loadUsers();
        this.setLoading(false);
    }
}
```

### Component

```jsx
export default App extends Component {
    
    @inject()
    vm: AppViewModel;
    
    render() {
        const { loading, userName } = this.vm;
        return (
            <div>
                {loading ? <Loading/> : <p>{userName}</p>} 
            </div>
        );
    }
}
```

