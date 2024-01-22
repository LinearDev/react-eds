# React-EDS

React-EDS is a JavaScript library creating bridges between React and non-React scopes.

The project has everything to make it easy for you to robotically save data in the browser throughout the React application cycle.

## Key Features
  * Manage global state across React and non-React code
  * Simple API with Hooks like ``useStoreState`` and ``useSlice``
  * Automatically sync and update state between React and non-React
  * Useful for things like managing global UI state

## Getting Started
Install with npm:
```bash
npm install react-eds
```

## Usage with typescript

### Create your store
react-eds allows you to define a global store that can be accessed across React and non-React code. Here is how to set it up:

First we define a slice of state - a ``user`` slice that contains a user's id, name and password:
```ts
export type userModel = {
    id: string
    name: string
    password: string
}

const initState: userModel = {
    id: "",
    name: "",
    password: ""
}
```

Next we create the slice using ``createSlice`` and provide the name and initial state:
```ts
const userSlice = reds.createSlice({
    name: "user",
    initialState: initState
});
```

Finally, we setup the global store providing an array of all the state slices:
```ts
export const storage = reds.setupStore([
    userSlice
])
```
This storage export provides the store initializer that can be run once in your app.
This pattern allows you to define your global state slices as ES6 modules and import/setup the store in your app root.

### Get some data from slices
After setting up the global store, you can access state slices throughout your app.

First we import the ``userModel`` type and ``reds`` instance:
```ts
import reds from "react-eds"
import { userModel } from "./store"
```

Inside a React component, we can get the ``user`` slice using ``getSliceData()``:
```ts
function App() {
  const user = reds.getSliceData<userModel>("user")

  return (
    <div>Hello {user.id}, it's React-EDS</div>
  )
}

export default App
```

``getSliceData`` takes the slice name (``user``) and infers the TypeScript type from the generic parameter.

This allows us to access the user state anywhere without having to pass it explicitly through props.

An alternative in React components is to use the ``useSlice()`` hook which provides a similar API but with dynamic variable updates:

```ts
function App() {

  const user = useSlice<userModel>("user")

  //...

}
```

### Set data and Update view
The ``useStoreState`` hook allows synchronizing state between React components and the global store.

We create a ``count`` state slice that is a number:
```ts
const [count, setCount] = useStoreState<number>("counter")
```

This gives us a ``count`` state variable and ``setCount`` function to update it, just like ``useState``.

We can then access the ``count`` value in our JSX:
```tsx
<div>{count}</div>
```

And update it by calling ``setCount()``:
```tsx
<button onClick={() => {
  setCount(count + 1)
}}>
  Increment
</button>
```

What's happening behind the scenes:

  * Updating ``count`` via ``setCount`` updates both the React component state as well as the global ``counter`` slice
  * If the global slice ``counter`` gets updated elsewhere, the component state will update automatically
This allows seamless state synchronization between React components and global state.

Some use cases:

  * Managing UI state from non-React code
  * Initializing state via API calls
  * Accessing state in browser extensions

### Subscribe on storage events
react-eds allows subscribing to changes in global state slices via reds.subscribe().

First we import ``reds`` and our ``userModel``:
```ts
import reds from "react-eds";
import { userModel } from "./store";
```

We have some async REST API logic:
```ts
export const makeRest = async () => {
    //create REST API query
}
```

We can subscribe to the ``user`` slice like:
```ts
reds.subscribe<userModel>("user", (user) => {
    if (!user.isAuth) {
        makeRest()
    }
})
```
This will invoke the callback anytime the ``user`` slice changes.

Here we check if the user is NOT authenticated then make the API call.

This allows reacting to state changes from outside React components - like in business logic.

Some other use cases:

  * Persisting state changes to localStorage
  * Logging/debugging state changes
  * Making API calls on state changes

## More cases

### Update data from non react scope and dynamic get in react
```ts
import { useEffect } from "react"
import reds, { useSlice } from "react-eds"

function App() {
  const count = useSlice<number>("counter")

  useEffect(() => {
    setInterval(() => {
      // this code can be some were else
      reds.setSliceData("counter", count+1)
    }, 500)
  })

  return (
    <>
      <div>{count}</div>
    </>
  )
}

export default App
```