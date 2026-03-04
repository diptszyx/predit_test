export const sanitizeArticleHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const images = Array.from(doc.querySelectorAll("img"));
  images.forEach((img) => {
    img.remove();
  });

  doc.body.innerHTML = doc.body.innerHTML.replace(
    /(<br\s*\/?>\s*){2,}/gi,
    "</p><p>",
  );
  return doc.body.innerHTML;
};
