# React-EDS

React-EDS is a JavaScript library creating bridges between React and non-React scopes.

The project has everything to make it easy for you to robotically save data in the browser throughout the React application cycle.

## Usage with typescript

### Create your store
```ts
import reds from "react-eds"

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

const userSlice = reds.createSlice({
    name: "user",
    initialState: initState
})

export const storage = reds.setupStore([
    userSlice
])
```

### Get some data from slices

```ts
import reds from "react-eds"
import { userModel } from "./store"

function App() {
  const user = reds.getSliceData<userModel>("user")

  return (
    <div>Hello {user.id}, it's React-EDS</div>
  )
}

export default App
```

### Set data and Update view

```ts
import { useStoreState } from "react-eds"

function App() {
  const [count, setCount] = useStoreState<number>("counter")

  return (
    <>
      <div>{count}</div>
      <button onClick={() => {setCount(count+1)}}>count</button>
    </>
  )
}

export default App
```

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

### Subscribe on storage events

```ts
import reds from "react-eds";
import { userModel } from "./store";

export const makeRest = async () => {
    //create REST API query
}

reds.subscribe<userModel>("user", (user) => {
    if (!user.isAuth) {
        makeRest()
    }
})
```