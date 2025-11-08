export async function sendOrderReadyEmail(opts: {
  to: string;
  name?: string;
  iccid: string;
  qrUrl: string;
}) {
  // TODO: integrate SendGrid or Make.com
  console.log('Send email to', opts.to, 'ICCID:', opts.iccid, 'QR:', opts.qrUrl);
}
