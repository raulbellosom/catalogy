import { NotFoundPage } from "./NotFoundPage";

/**
 * 403 Forbidden - Access Denied
 */
export function ForbiddenPage() {
  return <NotFoundPage code={403} />;
}
