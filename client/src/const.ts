export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the local login URL.
 * Since authentication is now handled locally via tRPC mutations,
 * we redirect unauthorized users to our own local login route.
 */
export const getLoginUrl = () => {
  return "/login";
};