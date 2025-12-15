// Route definitions - separate file to avoid circular dependencies

export type RouteKey = 'home' | 'createQuest' | 'createSidequest' | 'questDetails' | 'profile' | 'settings' | 'login'

export type RouteProps = Record<string, any> | null

export const routes: Record<RouteKey, RouteKey> = {
    home: 'home',
    createQuest: 'createQuest',
    createSidequest: 'createSidequest',
    questDetails: 'questDetails',
    profile: 'profile',
    settings: 'settings',
    login: 'login',
}

