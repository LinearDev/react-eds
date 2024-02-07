/**
    @name React Ethereum Data Storage

    @description is a JavaScript library creating bridges between React and non-React scopes by LinearDev (https://lineardev.net)
    @author Eugene K
    @link https://www.npmjs.com/package/react-eds
    @version 1.0.8
*/
import { useEffect, useState } from "react";
import { Md5 } from "ts-md5";

type StoreItem = {
    name: string
    initialState: any
    reducers?: Record<string, Function>
}

declare global {
    interface Window {
        EDS: any 
    }
}

const updateEvent = new CustomEvent("reds_update")

/**
 * @class REDS uses for creating bridge from react and non react scopes
 */
class StorageController {
    //listener functions
    listeners: Record<string, (data: any) => void>;

    constructor() {
        //init listener variable
        this.listeners = {};
    }

    /**
     * Init root store state
     * 
     * @param {StoreItem[]} storeItems array of slices
    */
    setupStore(storeItems: StoreItem[]): () => void {
        return () => {
            window.EDS = {}
            for (let item of storeItems) {
                window.EDS[item.name] = item.initialState
            }
        }
    }

    /**
     * Create store slice
     * 
     * @param {StoreItem} storeItems slice data
     * @returns {any} slice
    */
    createSlice({ name, initialState }: StoreItem): StoreItem {
        return { name: name, initialState: initialState };
    }

    /**
     * updates data in store
     * 
     * @param {string} name slice data
     * @param {any} data slice data
    */
    setSliceData<T>(name: string, data: T): void {
        window.EDS[name] = data as T;

        this.notify(name);
    }

    /**
     * Gets data from slice by slice name
     * 
     * @param {string} name slice name
    */
    getSliceData<T>(name: string) {
        return window.EDS[name] as T;
    }

    /**
     * Subscription function to detect slice updates
     * 
     * @param {string} name slice name
     * @param {Function} callback subscribe function
    */
    subscribe<T>(name: string, callback: (data: T) => void) {
        window.addEventListener("reds_update", (data: any) => {
            if (data.detail.name() == name) {
                callback(data.detail.data() as T);
            }
        })
    }

    /**
     * Subscription function to detect slice updates
     * 
     * @param {string} name slice data
    */
    notify(name: string): void  {
        window.dispatchEvent(new CustomEvent("reds_update", {
            bubbles: false,
            detail: {
                data: () => window.EDS[name],
                name: () => name
            }
        }))
    }

    /**
     * Used to change data in a slice without changing the whole slice.
     * @param {string} name The name of slice
     * @param {Object} object An object containing the data to be merged into the state
     */
    reduce(name: string, object: Record<any, any>) {
        let assign = (key: any, obj: any, currentState: any) => {
            if (typeof obj == "object") {
                for (const prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (currentState[key] && currentState[key].hasOwnProperty(prop)) {
                            currentState[key][prop] = obj[prop];
                        } else {
                            currentState[key] = { ...currentState[key], [prop]: obj[prop] };
                        }
                    }
                }
            }
        }

        const currentState = window.EDS[name];

        let initialKeys = Object.keys(object);
        for (const key of initialKeys) {
            assign(key, object[key], currentState);
        }
        
        //notify
        window.dispatchEvent(new CustomEvent("reds_update", {
            bubbles: false,
            detail: {
                data: () => window.EDS[name],
                name: () => name
            }
        }))

        //update store
        window.EDS[name] = currentState;
    }
}

const storeController = new StorageController();

export default storeController;

/**
 * Use slice to set data and dynamic update view
 * @param name slice name
 */
export function useStoreState <T>(name: string) {
    // default react useState hook
    const [state, setState] = useState<T>(storeController.getSliceData<T>(name));

    useEffect(() => {
        //if state updates set new data in store
        storeController.setSliceData<T>(name, state)
    }, [state, name]);

    //subscribe to updates from store
    storeController.subscribe<T>(name, (data) => {
        //hash new data
        const hash = Md5.hashStr(String(data))

        //hash old data
        const hashOld = Md5.hashStr(String(state))

        //if hash sum of states are different, dispach data 
        if (hash !== hashOld) {
            setState(data)
        }
    })

    //change state of useState hook and store
    const setCustomState = (value: T) => {
        storeController.setSliceData<T>(name, value);
        setState(value);
    };

    return [state, setCustomState] as const;
}

/**
 * Use slice state to dynamic get data
 * @param name slice name
 */
export function useSlice <T>(name: string): T {
    // default react useState hook
    const [state, setState] = useState<T>(storeController.getSliceData<T>(name));

    //subscribe to updates from store
    storeController.subscribe<T>(name, (data) => {
        setState(data)
    })

    return state;
}
