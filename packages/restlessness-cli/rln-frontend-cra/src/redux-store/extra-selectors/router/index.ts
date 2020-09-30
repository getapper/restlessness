import { RootState } from "redux-store";

export enum HashRoutes {
  Undefined,
  Other,
  Dashboard,
  ProjectPerformance,
  ProjectSentiment,
  ProjectInfluencers,
  ProjectThemes,
  ProjectList,
  ProjectDetails,
}

export const getCurrentRouterLocation = (state: RootState): HashRoutes => {
  if (state?.router?.location?.hash.match(/#\/project-details\/(.*?)/)) {
    if (
      state?.router?.location?.hash.match(
        /#\/project-details\/(.*?)\/performance/
      )
    )
      return HashRoutes.ProjectPerformance;
    if (
      state?.router?.location?.hash.match(/#\/project-details\/(.*?)\/themes/)
    )
      return HashRoutes.ProjectThemes;
    if (
      state?.router?.location?.hash.match(
        /#\/project-details\/(.*?)\/sentiment/
      )
    )
      return HashRoutes.ProjectSentiment;
    if (
      state?.router?.location?.hash.match(
        /#\/project-details\/(.*?)\/influencers/
      )
    )
      return HashRoutes.ProjectInfluencers;
    return HashRoutes.ProjectDetails;
  }
  switch (state?.router?.location?.hash) {
    case "":
      return HashRoutes.Undefined;
    case "#/dashboard":
      return HashRoutes.Dashboard;
    case "#/dashboard/projects-list":
      return HashRoutes.ProjectList;
    default:
      return HashRoutes.Other;
  }
};
