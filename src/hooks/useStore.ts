import { useEffect, useState } from 'react';

type Store<T> = {
    getState: () => T;
    subscribe: (listener: (state: T) => void) => () => void;
};

export function useStore<T>(store: Store<T>) {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            setState(state);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return state;
} 