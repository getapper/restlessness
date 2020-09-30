import { AlertTypes } from "../";
import { Action } from "redux";

export interface FeedbackState {
  open: boolean;
  type: AlertTypes;
  message: string;
}

export interface SetFeedbackAction extends Action {
  payload: {
    type?: AlertTypes;
    message?: string;
  };
}
