import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import Home from '../views/Main/Home'
import CreateQuest from '../views/Main/CreateQuest'
import QuestDetails from '../views/Main/QuestDetails'
import Profile from '../views/Main/Profile'
import Settings from '../views/Main/Settings'
import Login from '../views/Auth/Login'
import Signup from '../views/Auth/Signup'

export type RouteKey = 'home' | 'createQuest' | 'questDetails' | 'profile' | 'settings' | 'login' | 'signup'

export const routes: Record<RouteKey, RouteKey> = {
    home: 'home',
    createQuest: 'createQuest',
    questDetails: 'questDetails',
    profile: 'profile',
    settings: 'settings',
    login: 'login',
    signup: 'signup',
}

const routeComponents: Record<RouteKey, React.ComponentType> = {
    home: Home,
    createQuest: CreateQuest,
    questDetails: QuestDetails,
    profile: Profile,
    settings: Settings,
    login: Login,
    signup: Signup,
}

export const getRouteComponent = (route: RouteKey): ReactNode => {
    const Component = routeComponents[route]
    return Component ? <Component /> : null
}

interface ContextType {
    route: RouteKey
    setRoute: Dispatch<SetStateAction<RouteKey>>,
    routes: typeof routes,
}

const defaultContext: ContextType = {
    route: routes.home,
    setRoute: () => {
    },
    routes,
}

const NavigationContext = createContext<ContextType>(defaultContext)

interface Props {
    children: ReactNode
}

export default function NavigationProvider({ children }: Props) {
    
    const [route, setRoute] = useState<RouteKey>(routes.home)

    return (
        <NavigationContext.Provider value={{
            route,
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
