export const removeBrokenImages = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const images = Array.from(doc.querySelectorAll("img"));
  images.forEach(img => {
    img.remove()
  });

  return doc.body.innerHTML;
}