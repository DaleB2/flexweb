import crypto from "crypto";

import { buildSignatureHeaders } from "./esim";

export async function orderEsim(draft: {
  slug: string;
  packageCode: string;
  periodNum: number;
  price1e4: number;
}) {
  const body = {
    transactionId: crypto.randomUUID(),
    amount: draft.price1e4,
    packageInfoList: [
      {
        slug: draft.slug,
        packageCode: draft.packageCode,
        count: 1,
        price: draft.price1e4,
        periodNum: draft.periodNum,
      },
    ],
  };
  const res = await fetch('https://api.esimaccess.com/api/v1/open/esim/order', {
    method: 'POST',
    headers: buildSignatureHeaders(body),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Order eSIM failed');
  const json = await res.json();
  return {
    orderNo: json.obj.orderNo,
    esimTranNo: null,
  };
}
