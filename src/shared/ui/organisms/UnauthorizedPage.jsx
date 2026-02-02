import { NotFoundPage } from "./NotFoundPage";

/**
 * 401 Unauthorized
 */
export function UnauthorizedPage() {
  return <NotFoundPage code={401} />;
}
