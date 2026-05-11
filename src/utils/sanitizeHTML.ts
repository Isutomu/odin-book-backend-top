// 3rd Party Modules
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export const sanitizeHTML = (content: string) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);

  const cleanHTML = DOMPurify.sanitize(content);
  return cleanHTML;
};
