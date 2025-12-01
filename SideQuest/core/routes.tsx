import { Route } from "./useNavigation";
import Home from "@/views/Main/Home";
import Profile from "@/views/Main/Profile";
import Settings from "@/views/Main/Settings";
import CreateQuest from "@/views/Main/CreateQuest";
import QuestDetails from "@/views/Main/QuestDetails";
import Login from "@/views/Auth/Login";
import Signup from "@/views/Auth/Signup";
import { ComponentType } from "react";

export const routes: Record<Route, ComponentType<any>> = {
  [Route.LOGIN]: Login,
  [Route.SIGNUP]: Signup,
  [Route.HOME]: Home,
  [Route.PROFILE]: Profile,
  [Route.CREATE_QUEST]: CreateQuest,
  [Route.QUEST_DETAILS]: QuestDetails,
  [Route.SETTINGS]: Settings,
};

