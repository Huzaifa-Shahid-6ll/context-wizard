/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliate from "../affiliate.js";
import type * as appBuilderGenerations from "../appBuilderGenerations.js";
import type * as chatMutations from "../chatMutations.js";
import type * as chatQueries from "../chatQueries.js";
import type * as contextManagement from "../contextManagement.js";
import type * as debug from "../debug.js";
import type * as feedback from "../feedback.js";
import type * as lib_auditLog from "../lib/auditLog.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_utils from "../lib/utils.js";
import type * as mutations from "../mutations.js";
import type * as onboarding from "../onboarding.js";
import type * as promptGenerators from "../promptGenerators.js";
import type * as promptTemplates from "../promptTemplates.js";
import type * as queries from "../queries.js";
import type * as security from "../security.js";
import type * as stripeMutations from "../stripeMutations.js";
import type * as testActions from "../testActions.js";
import type * as testEnv from "../testEnv.js";
import type * as users from "../users.js";
import type * as vectorSearch from "../vectorSearch.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  affiliate: typeof affiliate;
  appBuilderGenerations: typeof appBuilderGenerations;
  chatMutations: typeof chatMutations;
  chatQueries: typeof chatQueries;
  contextManagement: typeof contextManagement;
  debug: typeof debug;
  feedback: typeof feedback;
  "lib/auditLog": typeof lib_auditLog;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/utils": typeof lib_utils;
  mutations: typeof mutations;
  onboarding: typeof onboarding;
  promptGenerators: typeof promptGenerators;
  promptTemplates: typeof promptTemplates;
  queries: typeof queries;
  security: typeof security;
  stripeMutations: typeof stripeMutations;
  testActions: typeof testActions;
  testEnv: typeof testEnv;
  users: typeof users;
  vectorSearch: typeof vectorSearch;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
