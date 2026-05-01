import * as subscriptionService from "../services/subscriptionService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getSubscriptions = async (req, res, next) => {
  try {
    const result = await subscriptionService.getSubscriptions(req.user._id);
    sendSuccess(res, 200, "Subscriptions fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      req.params.id,
      req.user._id,
    );
    sendSuccess(res, 200, "Subscription fetched.", { subscription });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.createSubscription(
      req.user._id,
      req.body,
    );
    sendSuccess(res, 201, "Subscription created.", { subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.updateSubscription(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Subscription updated.", { subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id, req.user._id);
    sendSuccess(res, 200, "Subscription deleted.", null);
  } catch (error) {
    next(error);
  }
};
export const processDue = async (req, res, next) => {
  try {
    const result = await subscriptionService.processDueSubscriptions(req.user._id);
    sendSuccess(res, 200, "Due subscriptions processed.", result);
  } catch (error) {
    next(error);
  }
};
