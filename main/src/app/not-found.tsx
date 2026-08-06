import ErrorPage from "@/components/shared/ErrorPage";

/**
 * Custom 404 — Not Found page
 * Sports-themed "Game Over" design with navigation back to home.
 */
export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Game Over — Page Not Found"
      description="The page you're looking for seems to have left the playing field. Check the URL or head back to the home page."
    />
  );
}
