"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSlice = exports.useStoreState = void 0;
/**
    @name React Ethereum Data Storage

    @description is a JavaScript library creating bridges between React and non-React scopes by LinearDev (https://lineardev.net)
    @author Eugene K
    @link https://www.npmjs.com/package/react-eds
    @version 1.0.8
*/
const react_1 = require("react");
const ts_md5_1 = require("ts-md5");
const updateEvent = new CustomEvent("reds_update");
/**
 * @class REDS uses for creating bridge from react and non react scopes
 */
class StorageController {
    constructor() {
        //init listener variable
        this.listeners = {};
    }
    /**
     * Init root store state
     *
     * @param {StoreItem[]} storeItems array of slices
    */
    setupStore(storeItems) {
        return () => {
            window.EDS = {};
            for (let item of storeItems) {
                window.EDS[item.name] = item.initialState;
            }
        };
    }
    /**
     * Create store slice
     *
     * @param {StoreItem} storeItems slice data
     * @returns {any} slice
    */
    createSlice({ name, initialState }) {
        return { name: name, initialState: initialState };
    }
    /**
     * updates data in store
     *
     * @param {string} name slice data
     * @param {any} data slice data
    */
    setSliceData(name, data) {
        window.EDS[name] = data;
        this.notify(name);
    }
    /**
     * Gets data from slice by slice name
     *
     * @param {string} name slice name
    */
    getSliceData(name) {
        return window.EDS[name];
    }
    /**
     * Subscription function to detect slice updates
     *
     * @param {string} name slice name
     * @param {Function} callback subscribe function
    */
    subscribe(name, callback) {
        window.addEventListener("reds_update", (data) => {
            if (data.detail.name() == name) {
                callback(data.detail.data());
            }
        });
    }
    /**
     * Subscription function to detect slice updates
     *
     * @param {string} name slice data
    */
    notify(name) {
        window.dispatchEvent(new CustomEvent("reds_update", {
            bubbles: false,
            detail: {
                data: () => window.EDS[name],
                name: () => name
            }
        }));
    }
}
const storeController = new StorageController();
exports.default = storeController;
/**
 * Use slice to set data and dynamic update view
 * @param name slice name
 */
function useStoreState(name) {
    // default react useState hook
    const [state, setState] = (0, react_1.useState)(storeController.getSliceData(name));
    (0, react_1.useEffect)(() => {
        //if state updates set new data in store
        storeController.setSliceData(name, state);
    }, [state, name]);
    //subscribe to updates from store
    storeController.subscribe(name, (data) => {
        //hash new data
        const hash = ts_md5_1.Md5.hashStr(String(data));
        //hash old data
        const hashOld = ts_md5_1.Md5.hashStr(String(state));
        //if hash sum of states are different, dispach data 
        if (hash !== hashOld) {
            setState(data);
        }
    });
    //change state of useState hook and store
    const setCustomState = (value) => {
        storeController.setSliceData(name, value);
        setState(value);
    };
    return [state, setCustomState];
}
exports.useStoreState = useStoreState;
/**
 * Use slice state to dynamic get data
 * @param name slice name
 */
function useSlice(name) {
    // default react useState hook
    const [state, setState] = (0, react_1.useState)(storeController.getSliceData(name));
    //subscribe to updates from store
    storeController.subscribe(name, (data) => {
        setState(data);
    });
    return state;
}
exports.useSlice = useSlice;
