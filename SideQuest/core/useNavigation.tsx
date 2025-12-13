import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import Home from '../views/Main/Home'
import CreateQuest from '../views/Main/CreateQuest'
import QuestDetails from '../views/Main/QuestDetails'
import Profile from '../views/Main/Profile'
import Settings from '../views/Main/Settings'
import Login from '../views/Auth/Login'

export type RouteKey = 'home' | 'createQuest' | 'questDetails' | 'profile' | 'settings' | 'login'

export type RouteProps = Record<string, any> | null

export const routes: Record<RouteKey, RouteKey> = {
    home: 'home',
    createQuest: 'createQuest',
    questDetails: 'questDetails',
    profile: 'profile',
    settings: 'settings',
    login: 'login',
}

const routeComponents: Record<RouteKey, React.ComponentType<any>> = {
    home: Home,
    createQuest: CreateQuest,
    questDetails: QuestDetails,
    profile: Profile,
    settings: Settings,
    login: Login,
}

export const getRouteComponent = (route: RouteKey, props: RouteProps): ReactNode => {
    const Component = routeComponents[route]
    return Component ? <Component {...props} /> : null
}

interface ContextType {
    route: RouteKey
    routeProps: RouteProps
    setRoute: (route: RouteKey, props?: RouteProps) => void
    routes: typeof routes
}

const defaultContext: ContextType = {
    route: routes.home,
    routeProps: null,
    setRoute: () => {},
    routes,
}

const NavigationContext = createContext<ContextType>(defaultContext)

interface Props {
    children: ReactNode
}

export default function NavigationProvider({ children }: Props) {
    const [route, setRouteState] = useState<RouteKey>(routes.home)
    const [routeProps, setRouteProps] = useState<RouteProps>(null)

    const setRoute = useCallback((newRoute: RouteKey, props?: RouteProps) => {
        setRouteState(newRoute)
        setRouteProps(props ?? null)
    }, [])

    return (
        <NavigationContext.Provider value={{
            route,
            routeProps,
            setRoute,
            routes,
        }}>
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    return useContext(NavigationContext) 
}
