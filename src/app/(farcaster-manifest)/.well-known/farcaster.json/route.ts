import packageJson from '../../../../../package.json'
import { privateKeyToAccount, signMessage } from "viem/accounts";
import { getFidFromPrivateKey } from '../../../../viem/actions/getFidFromPrivateKey'
import { Hex } from 'viem';
/**
 * Farcaster Manifest requires signing the manifest with the 'custory' address as of now.
 *
 * You can state the private key to sign all the necessary manifest data
 * in `process.env.CUSTODY_WALLET_PRIVATE_KEY`.
 * To find one, you have to export it from Warpcast mobile App.
 *
 * Also it is recommended to put `process.env.CUSTODY_WALLET_FID` as well with
 * the FID that your custody wallet holds. Otherwise an onchain request will be
 * made to get one.
 *
 * OR ALTERNATIVELY, if you have built and signed the manifest in Warpcast itself,
 * you can delete this file and put the JSON contents into `public/.well-known/farcaster.json`
 */
export async function GET() {
  const appUrl = new URL((() => {
    if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return process.env.NEXT_PUBLIC_VERCEL_URL
    throw new Error('App URL has to be defined either via Vercel (`process.env.NEXT_PUBLIC_VERCEL_URL`) or by hands (`process.env.NEXT_PUBLIC_URL`).')
  })());

  const privateKey = (() => {
    if (!process.env.CUSTODY_WALLET_PRIVATE_KEY) throw new Error('Missing `process.env.CUSTODY_WALLET_PRIVATE_KEY` to retrieve FID to sign the Farcaster Manifest. Please provide one or override this route to a static one.')
    return process.env.CUSTODY_WALLET_PRIVATE_KEY as Hex
  })();
  const fid = Number(process.env.CUSTODY_WALLET_FID ?? await getFidFromPrivateKey({ privateKey }));
  const account = privateKeyToAccount(privateKey)

  return Response.json({
    "accountAssociation": {
      "header": {
        fid,
        "type": "custody",
        "key": account.address,
      },
      "payload": {
        "domain": appUrl.host
      },
      "signature": await signMessage({ message: appUrl.origin, privateKey }),
    },
    "config": {
      "version": packageJson.version,
      "name": packageJson.name,
      "icon": `${appUrl}icon.png`,
      "splashImage": `${appUrl}splashImage.png`,
      "splashBackgroundColor": "#000",
      "homeUrl": appUrl,
    },
  },
  );
}
