import { NotFoundPage } from "./NotFoundPage";

/**
 * 500 Internal Server Error
 */
export function ServerErrorPage({ message }) {
  return <NotFoundPage code={500} message={message} />;
}
