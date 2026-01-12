export const truncateText = (name: string, length = 21) => {
  return name.length <= length
    ? name.slice(0, length)
    : name.slice(0, length) + "...";
};
