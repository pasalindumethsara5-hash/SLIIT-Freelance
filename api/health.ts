export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'ok',
    platform: 'SLIIT Freelance Hub',
    commissionRate: 0.25,
    host: 'vercel',
  });
}
