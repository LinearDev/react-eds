type StoreItem = {
    name: string;
    initialState: any;
    reducers?: Record<string, Function>;
};
declare global {
    interface Window {
        EDS: any;
    }
}
/**
 * @class REDS uses for creating bridge from react and non react scopes
 */
declare class StorageController {
    listeners: Record<string, (data: any) => void>;
    constructor();
    /**
     * Init root store state
     *
     * @param {StoreItem[]} storeItems array of slices
    */
    setupStore(storeItems: StoreItem[]): () => void;
    /**
     * Create store slice
     *
     * @param {StoreItem} storeItems slice data
     * @returns {any} slice
    */
    createSlice({ name, initialState }: StoreItem): StoreItem;
    /**
     * updates data in store
     *
     * @param {string} name slice data
     * @param {any} data slice data
    */
    setSliceData<T>(name: string, data: T): void;
    /**
     * Gets data from slice by slice name
     *
     * @param {string} name slice name
    */
    getSliceData<T>(name: string): T;
    /**
     * Subscription function to detect slice updates
     *
     * @param {string} name slice name
     * @param {Function} callback subscribe function
    */
    subscribe<T>(name: string, callback: (data: T) => void): void;
    /**
     * Subscription function to detect slice updates
     *
     * @param {string} name slice data
    */
    notify(name: string): void;
}
declare const storeController: StorageController;
export default storeController;
/**
 * Use slice to set data and dynamic update view
 * @param name slice name
 */
export declare function useStoreState<T>(name: string): readonly [T, (value: T) => void];
/**
 * Use slice state to dynamic get data
 * @param name slice name
 */
export declare function useSlice<T>(name: string): T;
