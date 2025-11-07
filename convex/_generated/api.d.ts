/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as affiliate from "../affiliate.js";
import type * as contextManagement from "../contextManagement.js";
import type * as debug from "../debug.js";
import type * as feedback from "../feedback.js";
import type * as generate from "../generate.js";
import type * as mutations from "../mutations.js";
import type * as onboarding from "../onboarding.js";
import type * as promptGenerators from "../promptGenerators.js";
import type * as queries from "../queries.js";
import type * as security from "../security.js";
import type * as testActions from "../testActions.js";
import type * as testEnv from "../testEnv.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  affiliate: typeof affiliate;
  contextManagement: typeof contextManagement;
  debug: typeof debug;
  feedback: typeof feedback;
  generate: typeof generate;
  mutations: typeof mutations;
  onboarding: typeof onboarding;
  promptGenerators: typeof promptGenerators;
  queries: typeof queries;
  security: typeof security;
  testActions: typeof testActions;
  testEnv: typeof testEnv;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
