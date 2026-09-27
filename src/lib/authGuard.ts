/**
 * Centralized auth-guard for raw fetch() calls.
 *
 * Call `handleAuthResponse(response)` after every authenticated fetch.
 * If the response is 401 and there's a stored token, it clears credentials
 * and redirects to /login — once, even if many parallel requests fail.
 */

let isRedirecting = false;

/**
 * Returns `true` if the response indicates an expired / invalid token
 * and the user has been logged out. The caller should bail out of
 * further processing when this returns `true`.
 */
export function handleAuthResponse(response: Response): boolean {
  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !isRedirecting
  ) {
    const token = localStorage.getItem("token");
    if (token) {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => {
        window.location.href = "/login";
        isRedirecting = false;
      }, 100);
      return true;
    }
  }
  return false;
}
