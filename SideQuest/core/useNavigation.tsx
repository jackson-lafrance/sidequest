import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export enum Route {
    HOME,
    CREATE_QUEST,
    QUEST_DETAILS,
    PROFILE,
    SETTINGS,
    LOGIN,
    SIGNUP,
}


interface ContextType {
    route: Route
    loggedIn: boolean
    setRoute: (route: Route) => void
    setLoggedIn: (loggedIn: boolean) => void
    login: () => void
    logout: () => void
}

const defaultContext: ContextType = {
    route: Route.LOGIN,
    loggedIn: false,
    setRoute: () => {},
    setLoggedIn: () => {},
    login: () => {},
    logout: () => {},
}

const NavigationContext = createContext<ContextType>(defaultContext)

interface NavigationProviderProps {
    children: ReactNode
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
    const [loggedIn, setLoggedIn] = useState(false)
    const [route, setRoute] = useState<Route>(Route.LOGIN)

    
    useEffect(() => {
        if (loggedIn && (route === Route.LOGIN || route === Route.SIGNUP)) {
            setRoute(Route.HOME)
        } else if (!loggedIn && route !== Route.LOGIN && route !== Route.SIGNUP) {
            setRoute(Route.LOGIN)
        }
    }, [loggedIn, route])
    
    const login = () => {
        setLoggedIn(true)
        setRoute(Route.HOME)
    }
    
    const logout = () => {
        setLoggedIn(false)
        setRoute(Route.LOGIN)
    }

    return (
        <NavigationContext.Provider value={{
            route,
            loggedIn,
            setRoute,
            setLoggedIn,
            login,
            logout,
        }}>
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    return useContext(NavigationContext) 
}
