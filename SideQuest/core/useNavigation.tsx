import React, { createContext, useContext, useState, ReactNode } from 'react'
import Home from '../views/Main/Home'
import CreateQuest from '../views/Main/CreateQuest'
import QuestDetails from '../views/Main/QuestDetails'
import Profile from '../views/Main/Profile'
import Settings from '../views/Main/Settings'
import Login from '../views/Auth/Login'
import Signup from '../views/Auth/Signup'

export type RouteKey = 'home' | 'createQuest' | 'questDetails' | 'profile' | 'settings' | 'login' | 'signup'

const routeComponents: Record<RouteKey, () => ReactNode> = {
    home: () => <Home />,
    createQuest: () => <CreateQuest />,
    questDetails: () => <QuestDetails />,
    profile: () => <Profile />,
    settings: () => <Settings />,
    login: () => <Login />,
    signup: () => <Signup />,
}

interface ContextType {
    route: RouteKey
    setRoute: (route: RouteKey) => void,
    getRouteComponent: (route: RouteKey) => ReactNode,
}

const defaultContext: ContextType = {
    route: 'home',
    setRoute: () => {},
    getRouteComponent: () => null,
}

const NavigationContext = createContext<ContextType>(defaultContext)

interface Props {
    children: ReactNode
}

export default function NavigationProvider({ children }: Props) {
    const [route, setRoute] = useState<RouteKey>('home')

    const getRouteComponent = (routeKey: RouteKey): ReactNode => {
        return routeComponents[routeKey]()
    }

    return (
        <NavigationContext.Provider value={{
            route,
            setRoute,
            getRouteComponent,
        }}>
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    return useContext(NavigationContext) 
}
