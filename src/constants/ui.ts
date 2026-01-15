// Calculate semicircle progress (0-180 degrees)
const r = 40;
export const arcLength = Math.PI * r; // ~125.66 (a half)

const imageMarketLink = [
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXBTCD.webp%3Fsize%3Dsm&w=384&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXETHMAXY.webp%3Fsize%3Dsm&w=384&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXSOLMAXMON.webp%3Fsize%3Dsm&w=384&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXDOGE.webp%3Fsize%3Dsm&w=256&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXSOL26500.webp%3Fsize%3Dsm&w=256&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
  "https://kalshi.com/_next/image?url=https%3A%2F%2Fd1lvyva3zy5u58.cloudfront.net%2Fseries-images-webp%2FKXSHIBAD.webp%3Fsize%3Dsm&w=256&q=80&dpl=dpl_GMuAEvrWdvNKWAd7etdL7AsoBekq",
];

export const rdImageMarket = () => {
  const rd = Math.floor(Math.random() * imageMarketLink.length);
  return imageMarketLink[rd];
};
